import asyncio
import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from redis.asyncio import Redis
from app.config import settings

router = APIRouter(prefix="/progress", tags=["progress"])

@router.get("/{job_id}")
async def job_progress(job_id: str, request: Request):
    async def event_generator():
        redis = Redis.from_url(settings.REDIS_URL)
        pubsub = redis.pubsub()
        channel = f"job_progress:{job_id}"
        await pubsub.subscribe(channel)

        try:
            while True:
                # Check for client disconnect
                if await request.is_disconnected():
                    break

                try:
                    # Wait for message with timeout for heartbeat
                    message = await asyncio.wait_for(pubsub.get_message(ignore_subscribe_init=True), timeout=15.0)
                    
                    if message and message['type'] == 'message':
                        data = message['data'].decode('utf-8')
                        event = json.loads(data)
                        
                        yield f"data: {data}\n\n"
                        
                        # Terminal events
                        if event.get('event') in ['job_completed', 'job_failed']:
                            break
                            
                except asyncio.TimeoutError:
                    # Send heartbeat
                    yield ": heartbeat\n\n"
        finally:
            await pubsub.unsubscribe(channel)
            await redis.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
