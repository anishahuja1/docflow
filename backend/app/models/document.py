import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, BigInteger, TEXT, Boolean, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(TEXT, nullable=False)
    file_type = Column(String(50))
    file_size = Column(BigInteger)
    status = Column(Enum('queued', 'processing', 'completed', 'failed', name='process_status'), nullable=False, default='queued')
    upload_time = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed_at = Column(DateTime(timezone=True), nullable=True)
    extracted_data = Column(JSONB, nullable=True)
    reviewed_data = Column(JSONB, nullable=True)
    is_finalized = Column(Boolean, default=False)
    finalized_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(TEXT, nullable=True)
