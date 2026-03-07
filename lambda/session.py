import os
import time

import boto3

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')


def validate_session(token, expected_email=None):
    """Validate a session token from DynamoDB.

    Checks that the token exists, has not expired, and optionally that the
    associated email matches *expected_email*.

    Returns:
        tuple: (session_data_dict, None) on success, or
               (None, error_dict) on failure where error_dict contains
               'statusCode' and 'error' suitable for an HTTP response.
    """
    if not token:
        return None, {'statusCode': 401, 'error': 'Invalid or expired session token'}

    table = dynamodb.Table(TABLE_NAME)
    result = table.get_item(Key={'pk': f'SESSION#{token}'}).get('Item')

    if not result:
        return None, {'statusCode': 401, 'error': 'Invalid or expired session token'}

    now = int(time.time())
    ttl = int(result.get('ttl', 0))
    if ttl < now:
        return None, {'statusCode': 401, 'error': 'Session expired'}

    if expected_email is not None and result.get('email') != expected_email:
        return None, {'statusCode': 401, 'error': 'Session token does not match email'}

    return result, None
