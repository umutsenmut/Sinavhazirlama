from __future__ import annotations

import logging
import os
from typing import Any

from app.core.config import settings
from app.core.exceptions import DriveException

logger = logging.getLogger(__name__)


def get_drive_service() -> Any:
    """Google Drive API istemcisini döner."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        credentials_file = settings.GOOGLE_CREDENTIALS_FILE
        if not os.path.exists(credentials_file):
            raise DriveException(
                f"Google kimlik bilgileri dosyası bulunamadı: {credentials_file}"
            )

        scopes = ["https://www.googleapis.com/auth/drive"]
        credentials = service_account.Credentials.from_service_account_file(
            credentials_file, scopes=scopes
        )
        service = build("drive", "v3", credentials=credentials, cache_discovery=False)
        logger.info("Google Drive servisi başlatıldı.")
        return service
    except DriveException:
        raise
    except Exception as exc:
        logger.error("Google Drive başlatma hatası: %s", exc)
        raise DriveException("Google Drive servisi başlatılamadı") from exc
