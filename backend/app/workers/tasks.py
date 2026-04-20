import os
import time
import json
import uuid
import fitz  # PyMuPDF
import docx
from PIL import Image
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from redis import Redis
from app.workers.celery_app import celery_app
from app.models.document import Document
from app.models.job import ProcessingJob
from app.utils.redis_pubsub import publish_progress

# SYNC SQLAlchemy for Celery worker
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://docflow:docflow@postgres:5432/docflow")
# Remove +asyncpg if present for sync engine
SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")

engine = create_engine(SYNC_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Redis client for publishing
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = Redis.from_url(REDIS_URL)

STOPWORDS = {'this','that','with','from','have','been','they','their','would','could','about','which','there','where','when'}

def get_keywords(text: str, top_n=10):
    words = [w.lower() for w in text.split() if len(w) > 4 and w.lower() not in STOPWORDS]
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w for w, f in sorted_words[:top_n]]

def format_bytes(size):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

@celery_app.task(bind=True, autoretry_for=(Exception,), max_retries=3, countdown=5)
def process_document(self, document_id: str, job_id: str):
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()

        if not doc or not job:
            return "Document or Job not found"

        # Stage 1: job_started (0%)
        job.status = 'processing'
        job.started_at = datetime.now(timezone.utc)
        job.celery_task_id = self.request.id
        db.commit()
        publish_progress(redis_client, job_id, "job_started", 0, "Processing started")

        # Stage 2: document_parsing_started (15%)
        job.current_stage = "document_parsing_started"
        job.progress_percent = 15
        db.commit()
        publish_progress(redis_client, job_id, "document_parsing_started", 15, "Parsing document...")
        time.sleep(1.5)

        # Stage 3: document_parsing_completed (35%)
        ext = os.path.splitext(doc.filename)[1].lower()
        content = ""
        metadata = {
            "page_count": None,
            "image_dimensions": None
        }

        if ext == '.pdf':
            pdf = fitz.open(doc.file_path)
            metadata["page_count"] = len(pdf)
            for page in pdf:
                content += page.get_text()
            pdf.close()
        elif ext in ['.txt', '.csv']:
            with open(doc.file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        elif ext == '.docx':
            docx_doc = docx.Document(doc.file_path)
            content = "\n".join([p.text for p in docx_doc.paragraphs])
        elif ext in ['.png', '.jpg', '.jpeg']:
            with Image.open(doc.file_path) as img:
                metadata["image_dimensions"] = f"{img.width}x{img.height}"
            content = f"Image metadata extracted."
        else:
            content = f"Binary file: {doc.filename}"

        time.sleep(0.5)
        publish_progress(redis_client, job_id, "document_parsing_completed", 35, "Parsing completed")

        # Stage 4: field_extraction_started (55%)
        job.current_stage = "field_extraction_started"
        job.progress_percent = 55
        db.commit()
        publish_progress(redis_client, job_id, "field_extraction_started", 55, "Extracting fields...")
        time.sleep(0.8)

        # Stage 5: field_extraction_completed (75%)
        category_map = {
            '.pdf': 'pdf',
            '.txt': 'text',
            '.csv': 'spreadsheet',
            '.docx': 'document',
            '.png': 'image',
            '.jpg': 'image',
            '.jpeg': 'image'
        }
        category = category_map.get(ext, 'other')
        
        extracted_data = {
            "title": os.path.splitext(doc.original_filename)[0],
            "category": category,
            "summary": content[:500] if content else f"No content extracted from {doc.original_filename}",
            "word_count": len(content.split()) if content else 0,
            "line_count": len(content.splitlines()) if content else 0,
            "keywords": get_keywords(content) if content else [],
            "file_metadata": {
                "filename": doc.original_filename,
                "file_type": doc.file_type,
                "file_size_bytes": doc.file_size,
                "file_size_human": format_bytes(doc.file_size),
                "page_count": metadata["page_count"],
                "image_dimensions": metadata["image_dimensions"]
            },
            "processing_timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        publish_progress(redis_client, job_id, "field_extraction_completed", 75, "Extraction completed")

        # Stage 6: result_stored (90%)
        doc.extracted_data = extracted_data
        doc.status = 'completed'
        doc.processed_at = datetime.now(timezone.utc)
        
        job.status = 'completed'
        job.progress_percent = 100
        job.current_stage = "result_stored"
        db.commit()
        time.sleep(0.3)
        publish_progress(redis_client, job_id, "result_stored", 90, "Storing results...")

        # Stage 7: job_completed (100%)
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
        publish_progress(redis_client, job_id, "job_completed", 100, "Workflow complete")

    except Exception as e:
        db.rollback()
        error_msg = str(e)
        publish_progress(redis_client, job_id, "job_failed", 0, error_msg)
        
        # Reload objects to update status
        doc = db.query(Document).filter(Document.id == document_id).first()
        job = db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        
        if doc:
            doc.status = 'failed'
            doc.error_message = error_msg
        if job:
            job.status = 'failed'
            job.error_message = error_msg
        db.commit()
        raise e
    finally:
        db.close()
