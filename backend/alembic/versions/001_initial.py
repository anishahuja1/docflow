"""initial migration

Revision ID: 001
Revises: 
Create Date: 2024-05-20 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # Safely create the enum type only if it doesn't exist
    conn.execute(sa.text("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'process_status') THEN
                CREATE TYPE process_status AS ENUM ('queued', 'processing', 'completed', 'failed');
            END IF;
        END$$;
    """))

    # Create documents table only if it doesn't exist
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS documents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            filename VARCHAR(255) NOT NULL,
            original_filename VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            file_type VARCHAR(50),
            file_size BIGINT,
            status process_status NOT NULL DEFAULT 'queued',
            upload_time TIMESTAMPTZ DEFAULT NOW(),
            processed_at TIMESTAMPTZ,
            extracted_data JSONB,
            reviewed_data JSONB,
            is_finalized BOOLEAN DEFAULT FALSE,
            finalized_at TIMESTAMPTZ,
            error_message TEXT
        )
    """))

    # Create processing_jobs table only if it doesn't exist
    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS processing_jobs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
            status process_status NOT NULL DEFAULT 'queued',
            celery_task_id VARCHAR(255),
            current_stage VARCHAR(100),
            progress_percent INTEGER DEFAULT 0,
            retry_count INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            started_at TIMESTAMPTZ,
            completed_at TIMESTAMPTZ,
            error_message TEXT
        )
    """))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS processing_jobs"))
    conn.execute(sa.text("DROP TABLE IF EXISTS documents"))
    conn.execute(sa.text("DROP TYPE IF EXISTS process_status"))
