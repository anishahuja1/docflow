from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from .document import Document

class JobBase(BaseModel):
    document_id: UUID
    status: str = "queued"

class JobUpdate(BaseModel):
    status: Optional[str] = None
    celery_task_id: Optional[str] = None
    current_stage: Optional[str] = None
    progress_percent: Optional[int] = None
    retry_count: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class ProcessingJob(JobBase):
    id: UUID
    celery_task_id: Optional[str] = None
    current_stage: Optional[str] = None
    progress_percent: int
    retry_count: int
    max_retries: int
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    document: Optional[Document] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedJobs(BaseModel):
    items: List[ProcessingJob]
    total: int
    page: int
    page_size: int
    total_pages: int
