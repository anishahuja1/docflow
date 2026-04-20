import os
import uuid
import aiofiles
from datetime import datetime, timezone
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile, HTTPException
from app.models.document import Document
from app.models.job import ProcessingJob
from app.config import settings
from app.workers.tasks import process_document

class DocumentService:
    @staticmethod
    async def upload_files(db: AsyncSession, files: list[UploadFile]):
        results = []
        for file in files:
            ext = os.path.splitext(file.filename)[1].lower().strip(".")
            if ext not in settings.allowed_extensions_list:
                continue
            
            # Use UUID prefix for filename
            file_uuid = uuid.uuid4().hex
            safe_filename = f"{file_uuid}_{file.filename}"
            target_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
            
            # Save file
            os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
            async with aiofiles.open(target_path, 'wb') as out_file:
                content = await file.read()
                file_size = len(content)
                if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                     # Skip or raise error? User wants validation.
                     continue
                await out_file.write(content)
            
            # Create Document
            doc = Document(
                filename=safe_filename,
                original_filename=file.filename,
                file_path=target_path,
                file_type=file.content_type,
                file_size=file_size,
                status='queued'
            )
            db.add(doc)
            await db.flush() # Get ID
            
            # Create ProcessingJob
            job = ProcessingJob(
                document_id=doc.id,
                status='queued',
                max_retries=3
            )
            db.add(job)
            await db.flush()
            
            # Trigger Celery
            process_document.delay(str(doc.id), str(job.id))
            
            results.append({
                "document_id": doc.id,
                "job_id": job.id,
                "filename": file.filename,
                "status": "queued"
            })
        
        await db.commit()
        return results

    @staticmethod
    async def get_documents(
        db: AsyncSession, 
        search: str = None, 
        status: str = None, 
        sort_by: str = "upload_time", 
        order: str = "desc", 
        page: int = 1, 
        page_size: int = 20
    ):
        query = select(Document)
        
        if search:
            query = query.where(Document.original_filename.ilike(f"%{search}%"))
        
        if status and status != 'all':
            query = query.where(Document.status == status)
            
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query)
        
        # Sort
        col = getattr(Document, sort_by, Document.upload_time)
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
    async def get_document(db: AsyncSession, document_id: uuid.UUID):
        result = await db.execute(select(Document).where(Document.id == document_id))
        doc = result.scalar_one_or_none()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc

    @staticmethod
    async def update_review(db: AsyncSession, document_id: uuid.UUID, reviewed_data: dict):
        doc = await DocumentService.get_document(db, document_id)
        if doc.status != 'completed' or doc.is_finalized:
            raise HTTPException(status_code=400, detail="Document cannot be updated.")
        
        doc.reviewed_data = reviewed_data
        await db.commit()
        await db.refresh(doc)
        return doc

    @staticmethod
    async def finalize(db: AsyncSession, document_id: uuid.UUID):
        doc = await DocumentService.get_document(db, document_id)
        if doc.status != 'completed':
            raise HTTPException(status_code=400, detail="Document processing not completed.")
        
        doc.is_finalized = True
        doc.finalized_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(doc)
        return doc
