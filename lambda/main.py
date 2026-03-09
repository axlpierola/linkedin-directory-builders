import json
import os
import random
import time
import urllib.request
import re
import boto3
import boto3.dynamodb.conditions
import uuid
from urllib.error import URLError
from decimal import Decimal

import hashlib


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)

from validators import validate_email, validate_profile_fields, validate_social_link
from email_formatter import format_otp_email
from session import validate_session
from bi_service import record_bi_event
from rate_limiter import check_rate_limit

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')
SES_SENDER_EMAIL = os.environ.get('SES_SENDER_EMAIL')
CAPTCHA_SECRET_KEY = os.environ.get('CAPTCHA_SECRET_KEY')
ses_client = boto3.client('ses')

def _extract_client_ip(event):
    """Extract client IP from API Gateway event.

    Checks X-Forwarded-For header first (may contain comma-separated list),
    then falls back to requestContext.identity.sourceIp.
    """
    # X-Forwarded-For: client, proxy1, proxy2
    req_headers = event.get('headers') or {}
    xff = req_headers.get('X-Forwarded-For') or req_headers.get('x-forwarded-for') or ''
    if xff:
        return xff.split(',')[0].strip()

    identity = (event.get('requestContext') or {}).get('identity') or {}
    return identity.get('sourceIp', '0.0.0.0')


def validate_captcha(captcha_response):
    """Validate a CAPTCHA challenge response.

    Placeholder implementation: checks that captcha_response is present and
    non-empty. A real implementation would call the CAPTCHA provider's
    verification API using CAPTCHA_SECRET_KEY.

    Returns:
        tuple: (valid: bool, error_message: str | None)
    """
    if not captcha_response or not str(captcha_response).strip():
        return False, 'CAPTCHA verification failed'
    # TODO: Call actual CAPTCHA verification API with CAPTCHA_SECRET_KEY
    return True, None


def handler(event, context):
    print("Event:", json.dumps(event))
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    try:
        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        # --- Per-IP rate limiting for all actions (except request_otp which
        #     handles its own per-email rate limiting) ---
        if action and action != 'request_otp':
            client_ip = _extract_client_ip(event)
            allowed, rate_err = check_rate_limit(client_ip, action)
            if not allowed:
                return {
                    'statusCode': rate_err['statusCode'],
                    'headers': headers,
                    'body': json.dumps({
                        'error': rate_err['error'],
                        'retry_after': rate_err['retry_after'],
                    })
                }

        if action == 'preview':
            return handle_preview(body, headers)
        elif action == 'create':
            return handle_create(body, headers)
        elif action == 'list':
             return handle_list(body, headers)
        elif action == 'request_otp':
            return handle_request_otp(body, headers)
        elif action == 'verify_otp':
            return handle_verify_otp(body, headers)
        elif action == 'update':
            return handle_update(body, headers)
        elif action == 'lookup':
            return handle_lookup(body, headers)
        elif action == 'give_karma':
            return handle_give_karma(body, headers)
        elif action == 'feedback':
            return handle_feedback(body, headers)
        else:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid action'})
            }

    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def handle_preview(body, headers):
    linkedin_url = body.get('linkedinUrl')
    if not linkedin_url:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing linkedinUrl'})
        }

    linkedin_url = normalize_linkedin_url(linkedin_url)

    # Mock/Best Effort Scraping
    data = scrape_linkedin(linkedin_url)
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps(data)
    }

def normalize_linkedin_url(url):
    """Normalize LinkedIn URL to https://www.linkedin.com/in/... format"""
    if not url:
        return url
    url = url.strip().rstrip('/')
    # Add https:// if no protocol
    if not url.startswith('http://') and not url.startswith('https://'):
        url = 'https://' + url
    # Force https
    url = re.sub(r'^http://', 'https://', url, flags=re.IGNORECASE)
    # Ensure www prefix
    url = re.sub(r'^https://linkedin\.com', 'https://www.linkedin.com', url, flags=re.IGNORECASE)
    return url

def scrape_linkedin(url):
    mock_data = {
        'name': '',
        'role': '',
        'company': '',
        'photoUrl': '',
        'linkedinUrl': url
    }

    try:
        # Infer name from URL slug as fallback
        match = re.search(r'/in/([^/]+)', url)
        if match:
            slug = match.group(1)
            name_guess = slug.replace('-', ' ').title()
            mock_data['name'] = name_guess

        # Try scraping with multiple user agents
        user_agents = [
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        ]

        html = None
        for ua in user_agents:
            try:
                req = urllib.request.Request(url, headers={
                    'User-Agent': ua,
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
                })
                with urllib.request.urlopen(req, timeout=5) as response:
                    html = response.read().decode('utf-8', errors='replace')
                    if 'og:title' in html or 'og:image' in html:
                        break
            except Exception:
                continue

        if html:
            # Extract OG image
            og_image = re.search(r'<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"', html)
            if not og_image:
                og_image = re.search(r'content="([^"]+)"\s+(?:property|name)="og:image"', html)
            if og_image:
                photo = og_image.group(1).replace('&amp;', '&')
                if 'licdn.com' in photo or 'linkedin.com' in photo:
                    # Filter out LinkedIn's generic placeholder avatar
                    if 'static.licdn.com/aero-v1/sc/h/' not in photo:
                        mock_data['photoUrl'] = photo

            # Extract OG title
            og_title = re.search(r'<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"', html)
            if not og_title:
                og_title = re.search(r'content="([^"]+)"\s+(?:property|name)="og:title"', html)
            if not og_title:
                og_title = re.search(r'<title>([^<]+)</title>', html)

            if og_title:
                title_content = og_title.group(1).replace('&amp;', '&').replace('&#x27;', "'")
                # Remove "| LinkedIn" or "- LinkedIn" suffix
                title_content = re.split(r'\s*[|–]\s*LinkedIn', title_content)[0].strip()
                parts = [p.strip() for p in title_content.split(' - ')]
                if len(parts) >= 1 and parts[0]:
                    mock_data['name'] = parts[0]
                if len(parts) == 2:
                    mock_data['company'] = parts[1]
                elif len(parts) >= 3:
                    mock_data['role'] = parts[1]
                    mock_data['company'] = parts[2]

    except Exception as e:
        print(f"Scraping failed: {e}. Using fallback data.")

    return mock_data

def handle_create(body, headers):
    data = body.get('data')
    if not data:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing data'})
        }

    # Validate session token
    session_token = body.get('session_token')
    email = data.get('email', '').strip()
    session_data, err = validate_session(session_token, expected_email=email)
    if err:
        return {
            'statusCode': err['statusCode'],
            'headers': headers,
            'body': json.dumps({'error': err['error']})
        }

    # Check for duplicate email via GSI
    table = dynamodb.Table(TABLE_NAME)
    gsi_result = table.query(
        IndexName='email-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email),
        FilterExpression=boto3.dynamodb.conditions.Attr('pk').begins_with('PROFILE#'),
        Limit=10
    )
    if gsi_result.get('Items'):
        return {
            'statusCode': 409,
            'headers': headers,
            'body': json.dumps({'error': 'Este email ya está registrado. Usa la opción "Editar mi perfil" para actualizar tus datos.'})
        }

    # Validate required fields
    is_valid, errors = validate_profile_fields(data)
    if not is_valid:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': '; '.join(errors)})
        }

    # Store profile
    timestamp = str(int(time.time()))
    item = {
        'pk': f"PROFILE#{timestamp}",
        'email': email,
        'name': data.get('name', ''),
        'role': data.get('role', ''),
        'company': data.get('company', ''),
        'linkedinUrl': data.get('linkedinUrl', ''),
        'photoUrl': data.get('photoUrl', ''),
        'builder_type': data.get('builder_type', ''),
        'builder_categories': data.get('builder_categories', []),
        'country': data.get('country', ''),
        'social_links': data.get('social_links', {}),
        'karma_score': 0,
        'created_at': timestamp,
        'updated_at': timestamp,
    }
    table.put_item(Item=item)

    # Delete session token after successful creation
    table.delete_item(Key={'pk': f"SESSION#{session_token}"})

    # BI event: profile_created
    record_bi_event("profile_created", {
        "country": data.get('country', ''),
        "builder_type": data.get('builder_type', ''),
        "categories": data.get('builder_categories', []),
    })

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'item': item}, cls=DecimalEncoder)
    }

def handle_list(body, headers):
    table = dynamodb.Table(TABLE_NAME)
    response = table.scan()
    items = response.get('Items', [])

    # Filter to only return PROFILE# records
    items = [item for item in items if item.get('pk', '').startswith('PROFILE#')]

    # Sort by created_at desc
    items.sort(key=lambda x: x.get('created_at', '0'), reverse=True)

    # BI event: search_performed (only when filter params are present)
    country_filter = body.get('country_filter', '')
    category_filter = body.get('category_filter', '')
    name_query = body.get('name_query', '')
    if country_filter or category_filter or name_query:
        record_bi_event("search_performed", {
            "country_filter": country_filter,
            "category_filter": category_filter,
            "name_query": name_query,
        })

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'items': items}, cls=DecimalEncoder)
    }

OTP_RATE_LIMIT_MAX = 5
OTP_RATE_LIMIT_WINDOW = 900  # 15 minutes in seconds
OTP_TTL_SECONDS = 600  # 10 minutes


def handle_request_otp(body, headers):
    email = body.get('email', '').strip()

    is_valid, error_msg = validate_email(email)
    if not is_valid:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': error_msg})
        }

    table = dynamodb.Table(TABLE_NAME)
    now = int(time.time())
    otp_pk = f"OTP#{email}"

    # Fetch existing OTP record to check rate limit timestamps
    existing = table.get_item(Key={'pk': otp_pk}).get('Item')
    request_timestamps = []
    failure_count = 0
    failure_blocks = 0
    locked_until = 0

    if existing:
        request_timestamps = existing.get('request_timestamps', [])
        failure_count = int(existing.get('failure_count', 0))
        failure_blocks = int(existing.get('failure_blocks', 0))
        locked_until = int(existing.get('locked_until', 0))

    # Filter timestamps within the 15-minute window
    recent_timestamps = [ts for ts in request_timestamps if now - int(ts) < OTP_RATE_LIMIT_WINDOW]

    if len(recent_timestamps) >= OTP_RATE_LIMIT_MAX:
        oldest_in_window = min(int(ts) for ts in recent_timestamps)
        retry_after = OTP_RATE_LIMIT_WINDOW - (now - oldest_in_window)
        return {
            'statusCode': 429,
            'headers': headers,
            'body': json.dumps({
                'error': f'Rate limit exceeded. Try again in {max(1, retry_after // 60)} minutes.',
                'retry_after': max(1, retry_after)
            })
        }

    # Generate 6-digit OTP
    otp_code = str(random.randint(100000, 999999))

    # Update timestamps list
    recent_timestamps.append(now)

    # Store OTP record (overwrites any previous OTP for this email)
    otp_item = {
        'pk': otp_pk,
        'otp_code': otp_code,
        'created_at': now,
        'ttl': now + OTP_TTL_SECONDS,
        'failure_count': failure_count,
        'failure_blocks': failure_blocks,
        'locked_until': locked_until,
        'request_timestamps': recent_timestamps,
    }
    table.put_item(Item=otp_item)

    # Send OTP email via SES
    email_content = format_otp_email(email, otp_code)
    try:
        ses_client.send_email(
            Source=SES_SENDER_EMAIL,
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': email_content['subject'], 'Charset': 'UTF-8'},
                'Body': {
                    'Html': {'Data': email_content['body_html'], 'Charset': 'UTF-8'},
                    'Text': {'Data': email_content['body_text'], 'Charset': 'UTF-8'},
                }
            }
        )
    except Exception as e:
        print(f"SES send failed: {e}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to send verification email'})
        }

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'message': 'OTP sent to email'})
    }

OTP_FAILURE_THRESHOLD = 5
SESSION_TTL_SECONDS = 1800  # 30 minutes
MAX_LOCKOUT_SECONDS = 3600  # 60 minutes


def handle_verify_otp(body, headers):
    email = body.get('email', '').strip()
    otp = body.get('otp', '').strip()

    is_valid, error_msg = validate_email(email)
    if not is_valid:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': error_msg})
        }

    if not otp:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'OTP is required'})
        }

    table = dynamodb.Table(TABLE_NAME)
    now = int(time.time())
    otp_pk = f"OTP#{email}"

    # Look up OTP record
    result = table.get_item(Key={'pk': otp_pk}).get('Item')
    if not result:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'No OTP found for this email. Please request a new code.'})
        }

    # Check lockout (exponential backoff)
    locked_until = int(result.get('locked_until', 0))
    if locked_until > now:
        retry_after = locked_until - now
        return {
            'statusCode': 429,
            'headers': headers,
            'body': json.dumps({
                'error': f'Too many failed attempts. Locked for {max(1, retry_after // 60)} minutes.',
                'retry_after': retry_after
            })
        }

    # Check if OTP has expired
    ttl = int(result.get('ttl', 0))
    if ttl <= now:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'OTP has expired. Please request a new code.'})
        }

    stored_otp = result.get('otp_code', '')
    failure_count = int(result.get('failure_count', 0))
    failure_blocks = int(result.get('failure_blocks', 0))

    # Validate OTP
    if otp != stored_otp:
        # Increment failure count
        failure_count += 1
        update_expr = 'SET failure_count = :fc'
        expr_values = {':fc': failure_count}

        # Check if we've hit the threshold for a new lockout block
        if failure_count >= OTP_FAILURE_THRESHOLD:
            failure_blocks += 1
            lockout_seconds = min(2 ** failure_blocks * 60, MAX_LOCKOUT_SECONDS)
            update_expr += ', failure_blocks = :fb, locked_until = :lu, failure_count = :zero'
            expr_values[':fb'] = failure_blocks
            expr_values[':lu'] = now + lockout_seconds
            expr_values[':zero'] = 0

        table.update_item(
            Key={'pk': otp_pk},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
        )

        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid OTP'})
        }

    # OTP matches — success
    # Delete OTP record
    table.delete_item(Key={'pk': otp_pk})

    # Generate session token
    session_token = str(uuid.uuid4())
    session_item = {
        'pk': f"SESSION#{session_token}",
        'email': email,
        'created_at': now,
        'ttl': now + SESSION_TTL_SECONDS,
    }
    table.put_item(Item=session_item)

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'session_token': session_token,
            'expires_in': SESSION_TTL_SECONDS,
        })
    }




def handle_update(body, headers):
    data = body.get('data')
    if not data:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing data'})
        }

    # Validate session token and extract email
    session_token = body.get('session_token')
    session_data, err = validate_session(session_token)
    if err:
        return {
            'statusCode': err['statusCode'],
            'headers': headers,
            'body': json.dumps({'error': err['error']})
        }

    email = session_data.get('email')

    # Look up existing profile by email via GSI
    table = dynamodb.Table(TABLE_NAME)
    gsi_result = table.query(
        IndexName='email-index',
        KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email),
        FilterExpression=boto3.dynamodb.conditions.Attr('pk').begins_with('PROFILE#'),
        Limit=10
    )
    existing_items = gsi_result.get('Items', [])
    if not existing_items:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'No profile found for this email'})
        }

    existing_profile = existing_items[0]

    # Preserve original email and created_at
    timestamp = str(int(time.time()))
    updated_item = {
        'pk': existing_profile['pk'],
        'email': existing_profile['email'],
        'created_at': existing_profile.get('created_at', timestamp),
        'name': data.get('name', existing_profile.get('name', '')),
        'role': data.get('role', existing_profile.get('role', '')),
        'company': data.get('company', existing_profile.get('company', '')),
        'linkedinUrl': data.get('linkedinUrl', existing_profile.get('linkedinUrl', '')),
        'photoUrl': data.get('photoUrl', existing_profile.get('photoUrl', '')),
        'builder_type': data.get('builder_type', existing_profile.get('builder_type', '')),
        'builder_categories': data.get('builder_categories', existing_profile.get('builder_categories', [])),
        'country': data.get('country', existing_profile.get('country', '')),
        'social_links': data.get('social_links', existing_profile.get('social_links', {})),
        'karma_score': existing_profile.get('karma_score', 0),
        'updated_at': timestamp,
    }
    table.put_item(Item=updated_item)

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'item': updated_item}, cls=DecimalEncoder)
    }


def handle_lookup(body, headers):
    identifier = body.get('identifier', '').strip()
    if not identifier:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing identifier'})
        }

    table = dynamodb.Table(TABLE_NAME)

    if '@' in identifier:
        # Looks like an email — query GSI
        gsi_result = table.query(
            IndexName='email-index',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(identifier),
            Limit=1
        )
        items = gsi_result.get('Items', [])
        if items:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'email': items[0]['email']})
            }
    else:
        # Looks like a URL — scan for matching linkedinUrl
        scan_result = table.scan(
            FilterExpression=boto3.dynamodb.conditions.Attr('linkedinUrl').eq(identifier)
        )
        items = scan_result.get('Items', [])
        if items:
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True, 'email': items[0].get('email', '')})
            }

    return {
        'statusCode': 404,
        'headers': headers,
        'body': json.dumps({'error': 'No profile found for this identifier'})
    }

def handle_give_karma(body, headers):
    # Validate session token and extract giver email
    session_token = body.get('session_token')
    session_data, err = validate_session(session_token)
    if err:
        return {
            'statusCode': err['statusCode'],
            'headers': headers,
            'body': json.dumps({'error': err['error']})
        }
    giver_email = session_data['email']

    # Per-email rate limit for karma votes (in addition to per-IP checked in handler)
    allowed, rate_err = check_rate_limit(giver_email, 'give_karma')
    if not allowed:
        return {
            'statusCode': rate_err['statusCode'],
            'headers': headers,
            'body': json.dumps({
                'error': rate_err['error'],
                'retry_after': rate_err['retry_after'],
            })
        }

    # Validate vote value is +1 or -1
    vote = body.get('vote')
    if vote not in (1, -1):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Vote must be +1 or -1'})
        }

    recipient_pk = body.get('recipient_pk', '')
    if not recipient_pk:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Missing recipient_pk'})
        }

    table = dynamodb.Table(TABLE_NAME)

    # Look up recipient profile
    recipient = table.get_item(Key={'pk': recipient_pk}).get('Item')
    if not recipient:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': 'Recipient profile not found'})
        }

    # Self-vote check
    if giver_email == recipient.get('email'):
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Cannot give karma to yourself'})
        }

    # Conditional put KARMA record — fails if already exists (duplicate check)
    karma_pk = f"KARMA#{giver_email}#{recipient_pk}"
    now = int(time.time())
    try:
        table.put_item(
            Item={
                'pk': karma_pk,
                'giver_email': giver_email,
                'recipient_pk': recipient_pk,
                'vote': vote,
                'created_at': now,
            },
            ConditionExpression='attribute_not_exists(pk)'
        )
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        return {
            'statusCode': 409,
            'headers': headers,
            'body': json.dumps({'error': 'You have already given karma to this builder'})
        }

    # Atomic update recipient profile's karma_score
    result = table.update_item(
        Key={'pk': recipient_pk},
        UpdateExpression='SET karma_score = karma_score + :val',
        ExpressionAttributeValues={':val': vote},
        ReturnValues='ALL_NEW'
    )
    new_score = int(result['Attributes'].get('karma_score', 0))

    # BI event: karma_given
    record_bi_event("karma_given", {
        "giver_email_hash": hashlib.sha256(giver_email.encode()).hexdigest()[:16],
        "recipient_pk": recipient_pk,
        "vote": vote,
    })

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True, 'new_karma_score': new_score}, cls=DecimalEncoder)
    }


def handle_feedback(body, headers):
    message = (body.get('message') or '').strip()
    if not message:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'El mensaje es requerido'})
        }
    if len(message) > 2000:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'El mensaje es muy largo (max 2000 caracteres)'})
        }

    contact = (body.get('contact') or '').strip()[:200]
    timestamp = str(int(time.time()))

    table = dynamodb.Table(TABLE_NAME)
    table.put_item(Item={
        'pk': f'FEEDBACK#{timestamp}#{uuid.uuid4().hex[:8]}',
        'message': message,
        'contact': contact,
        'created_at': timestamp,
    })

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'success': True})
    }
