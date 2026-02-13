from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Audio Label AI Service"
    DEBUG: bool = True
    PORT: int = 8000

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0

    # MinIO
    MINIO_ENDPOINT: str = "localhost"
    MINIO_PORT: int = 9000
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_USE_SSL: bool = False
    MINIO_BUCKET: str = "audio-label"

    # AI Models
    WHISPER_MODEL: str = "base"  # tiny, base, small, medium, large-v3
    WHISPER_DEVICE: str = "cpu"  # cpu, cuda
    PYANNOTE_MODEL: str = "pyannote/speaker-diarization-3.1"

    # Processing
    MAX_AUDIO_SIZE: int = 500 * 1024 * 1024  # 500MB
    SUPPORTED_FORMATS: list = ["mp3", "wav", "flac", "ogg", "m4a"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()