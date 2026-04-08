from __future__ import annotations

import json
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Uygulama
    APP_NAME: str = "Sinavhazirlama"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Güvenlik
    SECRET_KEY: str = "gelistirme-icin-degistirin-uretimde-guclu-anahtar-kullanin!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Veritabanı
    DATABASE_URL: str = "sqlite+aiosqlite:///./sinavhazirlama.db"

    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # Google Drive
    GOOGLE_CREDENTIALS_FILE: str = "credentials.json"
    GOOGLE_DRIVE_ROOT_FOLDER_ID: str = ""

    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Dosya yükleme
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Ensure DATABASE_URL uses an async driver compatible with SQLAlchemy async."""
        async_schemes = ("postgresql+asyncpg://", "sqlite+aiosqlite://")
        if not any(v.startswith(scheme) for scheme in async_schemes):
            raise ValueError(
                "DATABASE_URL must use an async driver. "
                "Use 'postgresql+asyncpg://' for PostgreSQL or 'sqlite+aiosqlite://' for SQLite. "
                f"Got: {v!r}"
            )
        return v

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY en az 32 karakter olmalıdır")
        return v

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: Any) -> list[str]:
        """Accept ALLOWED_ORIGINS as a JSON array string, a comma-separated string, or a list."""
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(origin).strip() for origin in parsed if str(origin).strip()]
                except json.JSONDecodeError:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
