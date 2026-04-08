from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_workspace, get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.exam import ExamCreate, ExamListResponse, ExamResponse
from app.services.exam_service import ExamService

router = APIRouter()


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_exam(
    payload: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> ExamResponse:
    """Yeni sınav oluşturur."""
    svc = ExamService(db)
    exam = await svc.create(payload, workspace_id=workspace.id)
    return ExamResponse.model_validate(exam)


@router.get("", response_model=ExamListResponse)
async def list_exams(
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> ExamListResponse:
    """Çalışma alanına ait sınavları listeler."""
    svc = ExamService(db)
    exams, total = await svc.list_by_workspace(workspace.id, page=page, size=size)
    return ExamListResponse(items=[ExamResponse.model_validate(e) for e in exams], total=total, page=page, size=size)


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> ExamResponse:
    """Sınav detayını döner."""
    svc = ExamService(db)
    exam = await svc.get_by_id(exam_id, workspace_id=workspace.id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sınav bulunamadı")
    return ExamResponse.model_validate(exam)


@router.delete("/{exam_id}", status_code=status.HTTP_200_OK)
async def delete_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> dict[str, str]:
    """Sınavı siler."""
    svc = ExamService(db)
    deleted = await svc.delete(exam_id, workspace_id=workspace.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sınav bulunamadı")
    return {"mesaj": "Sınav başarıyla silindi"}


@router.post("/{exam_id}/generate", response_model=ExamResponse)
async def generate_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> ExamResponse:
    """Sınav için Gemini AI ile sorular üretir."""
    svc = ExamService(db)
    exam = await svc.get_by_id(exam_id, workspace_id=workspace.id)
    if not exam:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sınav bulunamadı")
    if exam.status == "generating":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Sınav zaten üretiliyor")

    exam = await svc.generate_questions(exam)
    return ExamResponse.model_validate(exam)
