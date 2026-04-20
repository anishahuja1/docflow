import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.document_service import DocumentService
from app.services.export_service import ExportService
from app.schemas.document import Document, DocumentReview, PaginatedDocuments

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    return await DocumentService.upload_files(db, files)

@router.get("", response_model=PaginatedDocuments)
async def list_documents(
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "upload_time",
    order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1),
    db: AsyncSession = Depends(get_db)
):
    return await DocumentService.get_documents(db, search, status, sort_by, order, page, page_size)

@router.get("/{document_id}", response_model=Document)
async def get_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await DocumentService.get_document(db, document_id)

@router.patch("/{document_id}/review", response_model=Document)
async def review_document(
    document_id: uuid.UUID,
    review: DocumentReview,
    db: AsyncSession = Depends(get_db)
):
    return await DocumentService.update_review(db, document_id, review.reviewed_data)

@router.post("/{document_id}/finalize", response_model=Document)
async def finalize_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await DocumentService.finalize(db, document_id)

@router.get("/{document_id}/export/json")
async def export_json(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doc = await DocumentService.get_document(db, document_id)
    return ExportService.export_json(doc)

@router.get("/{document_id}/export/csv")
async def export_csv(document_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    doc = await DocumentService.get_document(db, document_id)
    return ExportService.export_csv(doc)
