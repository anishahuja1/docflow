from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID

class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    file_type: Optional[str] = None
    file_size: Optional[int] = None

class DocumentCreate(DocumentBase):
    file_path: str

class DocumentUpdate(BaseModel):
    status: Optional[str] = None
    processed_at: Optional[datetime] = None
    extracted_data: Optional[dict] = None
    reviewed_data: Optional[dict] = None
    is_finalized: Optional[bool] = None
    finalized_at: Optional[datetime] = None
    error_message: Optional[str] = None

class DocumentReview(BaseModel):
    reviewed_data: dict

class Document(DocumentBase):
    id: UUID
    status: str
    upload_time: datetime
    processed_at: Optional[datetime] = None
    extracted_data: Optional[dict] = None
    reviewed_data: Optional[dict] = None
    is_finalized: bool
    finalized_at: Optional[datetime] = None
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PaginatedDocuments(BaseModel):
    items: List[Document]
    total: int
    page: int
    page_size: int
    total_pages: int
