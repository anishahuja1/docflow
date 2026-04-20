from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://docflow:docflow@postgres:5432/docflow"
    REDIS_URL: str = "redis://redis:6379/0"
    UPLOAD_DIR: str = "/uploads"
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: str = "pdf,txt,docx,png,jpg,jpeg,csv"
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"

    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",")]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
