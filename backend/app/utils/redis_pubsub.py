import json
from datetime import datetime

def publish_progress(redis_client, job_id, event_type, progress, message, extra=None):
    channel = f"job_progress:{job_id}"
    payload = {
        "event": event_type,
        "job_id": str(job_id),
        "progress": progress,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        **(extra or {})
    }
    redis_client.publish(channel, json.dumps(payload))
