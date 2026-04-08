from __future__ import annotations

from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_workspace, get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.services.document_service import DocumentService
from app.services.exam_service import ExamService

router = APIRouter()


class MaterialGenerateRequest(BaseModel):
    exam_id: int
    include_answer_key: bool = True
    upload_to_drive: bool = False


class MaterialGenerateResponse(BaseModel):
    exam_id: int
    file_path: str
    drive_url: str | None = None
    mesaj: str


@router.post("/generate", response_model=MaterialGenerateResponse)
async def generate_material(
    payload: MaterialGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> MaterialGenerateResponse:
    """Tamamlanmış sınav için Word dokümanı üretir ve isteğe bağlı Drive'a yükler."""
    exam_svc = ExamService(db)
    exam = await exam_svc.get_by_id(payload.exam_id, workspace_id=workspace.id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sınav bulunamadı")
    if exam.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Sınav henüz tamamlanmamış. Önce soru üretimi yapın.",
        )

    doc_svc = DocumentService()
    file_path = await doc_svc.generate_exam_document(
        exam=exam,
        include_answer_key=payload.include_answer_key,
    )

    drive_url: str | None = None
    if payload.upload_to_drive:
        from app.services.drive_service import DriveService

        drive_svc = DriveService()
        drive_url = await drive_svc.upload_file(
            file_path=file_path,
            folder_name=workspace.name,
        )

    return MaterialGenerateResponse(
        exam_id=exam.id,
        file_path=file_path,
        drive_url=drive_url,
        mesaj="Materyal başarıyla oluşturuldu",
    )
