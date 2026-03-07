import os
import time
import uuid
import boto3

dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME')

# TTL: 90 days in seconds
BI_EVENT_TTL_SECONDS = 90 * 24 * 60 * 60


def record_bi_event(event_type, metadata=None):
    """Record a BI event to DynamoDB. Fire-and-forget: failures are logged but never raised."""
    try:
        now = int(time.time())
        event_id = str(uuid.uuid4())
        pk = f"BI#{event_type}#{now}#{event_id}"

        item = {
            'pk': pk,
            'event_type': event_type,
            'timestamp': now,
            'metadata': metadata or {},
            'ttl': now + BI_EVENT_TTL_SECONDS,
        }

        table = dynamodb.Table(TABLE_NAME)
        table.put_item(Item=item)
    except Exception as e:
        print(f"[BI] Failed to record event '{event_type}': {e}")
