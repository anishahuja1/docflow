import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.job_service import JobService
from app.schemas.job import ProcessingJob, PaginatedJobs

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("", response_model=PaginatedJobs)
async def list_jobs(
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "created_at",
    order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    db: AsyncSession = Depends(get_db)
):
    return await JobService.get_jobs(db, search, status, sort_by, order, page, page_size)

@router.get("/{job_id}", response_model=ProcessingJob)
async def get_job(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await JobService.get_job(db, job_id)

@router.post("/{job_id}/retry", response_model=ProcessingJob)
async def retry_job(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await JobService.retry_job(db, job_id)
