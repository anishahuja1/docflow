import uuid
from sqlalchemy import select, func, desc, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.job import ProcessingJob
from app.models.document import Document
from app.workers.tasks import process_document
from celery.result import AsyncResult
from app.workers.celery_app import celery_app

class JobService:
    @staticmethod
    async def get_jobs(
        db: AsyncSession, 
        search: str = None, 
        status: str = None, 
        sort_by: str = "created_at", 
        order: str = "desc", 
        page: int = 1, 
        page_size: int = 20
    ):
        # Join with Document for search
        query = select(ProcessingJob).options(selectinload(ProcessingJob.document))
        
        if search:
            query = query.join(Document, ProcessingJob.document_id == Document.id).where(Document.original_filename.ilike(f"%{search}%"))
        
        if status and status != 'all':
            query = query.where(ProcessingJob.status == status)
            
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)
        
        # Sort
        col = getattr(ProcessingJob, sort_by, ProcessingJob.created_at)
        if order == "desc":
            query = query.order_by(desc(col))
        else:
            query = query.order_by(col)
            
        # Paginate
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        items = result.scalars().all()
        
        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size if total > 0 else 0
        }

    @staticmethod
    async def get_job(db: AsyncSession, job_id: uuid.UUID):
        result = await db.execute(
            select(ProcessingJob)
            .options(selectinload(ProcessingJob.document))
            .where(ProcessingJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        return job

    @staticmethod
    async def retry_job(db: AsyncSession, job_id: uuid.UUID):
        job = await JobService.get_job(db, job_id)
        
        if job.status != 'failed':
            raise HTTPException(status_code=400, detail="Job is not in failed state.")
            
        if job.retry_count >= job.max_retries:
            raise HTTPException(status_code=400, detail=f"Maximum retries ({job.max_retries}) exceeded.")

        # Idempotency check: check if task is already running
        if job.celery_task_id:
            res = AsyncResult(job.celery_task_id, app=celery_app)
            if res.state in ['STARTED', 'PENDING', 'RECEIVED']:
                raise HTTPException(status_code=409, detail="Task is already running or pending.")

        # Update job
        job.status = 'queued'
        job.retry_count += 1
        job.error_message = None
        job.progress_percent = 0
        job.current_stage = None
        
        await db.commit()
        await db.refresh(job)
        
        # Re-enqueue
        process_document.delay(str(job.document_id), str(job.id))
        
        return job
