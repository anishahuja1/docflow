import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.routers import documents_router, jobs_router, progress_router
from app.database import engine, Base

# Import models so SQLAlchemy knows about them before create_all
from app.models.document import Document
from app.models.job import ProcessingJob

app = FastAPI(title="DocFlow API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Auto-create all database tables on startup (idempotent)
    # This replaces the need to run 'alembic upgrade head' manually
    async with engine.begin() as conn:
        # Create the process_status enum type first if it doesn't exist
        await conn.execute(__import__('sqlalchemy').text("""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'process_status') THEN
                    CREATE TYPE process_status AS ENUM ('queued', 'processing', 'completed', 'failed');
                END IF;
            END$$;
        """))
        await conn.run_sync(Base.metadata.create_all)

# Include routers
app.include_router(documents_router, prefix="/api/v1")
app.include_router(jobs_router, prefix="/api/v1")
app.include_router(progress_router, prefix="/api/v1")

# Mount uploads directory as static files
app.mount("/api/v1/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
async def root():
    return {"message": "Welcome to DocFlow API", "docs": "/docs"}
