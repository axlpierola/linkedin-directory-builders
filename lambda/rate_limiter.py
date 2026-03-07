import hashlib
import os
import time

import boto3

from bi_service import record_bi_event

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')

# Rate limit thresholds: {action: (max_requests, window_seconds)}
# Note: request_otp rate limiting is handled per-email inside the OTP handler itself,
# so it is excluded here to avoid double-limiting.
RATE_LIMIT_THRESHOLDS = {
    'create': (3, 3600),        # 3 per hour
    'give_karma': (10, 3600),   # 10 per hour
}

DEFAULT_THRESHOLD = (60, 60)    # 60 per minute for all other actions


def _hash_identifier(identifier):
    """SHA-256 hash an identifier (IP or email) for privacy."""
    return hashlib.sha256(identifier.encode()).hexdigest()


def check_rate_limit(identifier, action):
    """Check and increment a sliding-window rate limit counter in DynamoDB.

    Args:
        identifier: The raw identifier to rate-limit on (IP address or email).
        action: The API action name (e.g. 'create', 'give_karma').

    Returns:
        tuple: (allowed: bool, error_response: dict | None)
            If allowed is True, error_response is None.
            If allowed is False, error_response is a dict with 'statusCode',
            'error', and 'retry_after' suitable for an HTTP response.
    """
    max_requests, window_seconds = RATE_LIMIT_THRESHOLDS.get(action, DEFAULT_THRESHOLD)
    identifier_hash = _hash_identifier(identifier)
    pk = f"RATELIMIT#{identifier_hash}#{action}"

    table = dynamodb.Table(TABLE_NAME)
    now = int(time.time())

    # Read existing counter
    result = table.get_item(Key={'pk': pk}).get('Item')

    if result:
        window_start = int(result.get('window_start', 0))
        request_count = int(result.get('request_count', 0))

        # Check if we're still inside the current window
        if now - window_start < window_seconds:
            if request_count >= max_requests:
                # Rate limit exceeded
                retry_after = window_seconds - (now - window_start)
                retry_after = max(1, retry_after)

                # Log violation as BI event
                record_bi_event("rate_limit_triggered", {
                    "ip_hash": identifier_hash[:16],
                    "action": action,
                    "threshold": max_requests,
                })

                return False, {
                    'statusCode': 429,
                    'error': f'Rate limit exceeded. Try again in {max(1, retry_after // 60)} minutes.',
                    'retry_after': retry_after,
                }

            # Increment counter within existing window
            table.update_item(
                Key={'pk': pk},
                UpdateExpression='SET request_count = request_count + :one',
                ExpressionAttributeValues={':one': 1},
            )
            return True, None

    # Start a new window (first request or window expired)
    table.put_item(Item={
        'pk': pk,
        'request_count': 1,
        'window_start': now,
        'ttl': now + window_seconds,
    })
    return True, None
