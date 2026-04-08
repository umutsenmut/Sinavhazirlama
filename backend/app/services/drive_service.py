from __future__ import annotations

import logging
from pathlib import Path

from app.core.config import settings
from app.core.drive import get_drive_service
from app.core.exceptions import DriveException

logger = logging.getLogger(__name__)


class DriveService:
    def __init__(self) -> None:
        self._service = None

    def _get_service(self):
        if self._service is None:
            self._service = get_drive_service()
        return self._service

    async def _get_or_create_folder(self, name: str, parent_id: str | None = None) -> str:
        """Klasörü bulur veya oluşturur, ID döner."""
        service = self._get_service()
        query = f"name='{name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
        if parent_id:
            query += f" and '{parent_id}' in parents"

        results = service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get("files", [])
        if files:
            return files[0]["id"]

        metadata = {
            "name": name,
            "mimeType": "application/vnd.google-apps.folder",
        }
        if parent_id:
            metadata["parents"] = [parent_id]

        folder = service.files().create(body=metadata, fields="id").execute()
        return folder["id"]

    async def upload_file(
        self,
        file_path: str,
        folder_name: str,
    ) -> str:
        """Dosyayı Drive'a yükler ve paylaşım URL'ini döner."""
        try:
            from googleapiclient.http import MediaFileUpload

            service = self._get_service()
            root_id = settings.GOOGLE_DRIVE_ROOT_FOLDER_ID or None
            folder_id = await self._get_or_create_folder(folder_name, parent_id=root_id)

            file_name = Path(file_path).name
            media = MediaFileUpload(
                file_path,
                mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
            file_metadata = {
                "name": file_name,
                "parents": [folder_id],
            }
            uploaded = service.files().create(
                body=file_metadata, media_body=media, fields="id, webViewLink"
            ).execute()

            # Herkes görüntüleyebilir izni
            service.permissions().create(
                fileId=uploaded["id"],
                body={"type": "anyone", "role": "reader"},
            ).execute()

            url = uploaded.get("webViewLink", "")
            logger.info("Dosya Drive'a yüklendi: %s", url)
            return url
        except DriveException:
            raise
        except Exception as exc:
            logger.error("Drive yükleme hatası: %s", exc)
            raise DriveException("Dosya Google Drive'a yüklenemedi") from exc
