from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_workspace, get_db
from app.core.config import settings
from app.models.user import User
from app.models.workspace import Workspace
from app.schemas.plan import PlanResponse
from app.schemas.common import PaginatedResponse
from app.services.plan_service import PlanService

router = APIRouter()

ALLOWED_MIME_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}


@router.post("", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def upload_plan(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> PlanResponse:
    """Word dokümanı olarak yıllık plan yükler ve kazanımları çıkarır."""
    if file.content_type not in ALLOWED_MIME_TYPES and not (
        file.filename and file.filename.lower().endswith((".docx", ".doc"))
    ):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Yalnızca Word (.docx, .doc) dosyaları kabul edilmektedir",
        )

    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Dosya boyutu {settings.MAX_UPLOAD_SIZE_MB} MB sınırını aşıyor",
        )

    svc = PlanService(db)
    plan = await svc.upload_and_parse(
        content=content,
        filename=file.filename or "plan.docx",
        workspace_id=workspace.id,
    )
    return PlanResponse.model_validate(plan)


@router.get("", response_model=PaginatedResponse[PlanResponse])
async def list_plans(
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> PaginatedResponse[PlanResponse]:
    """Çalışma alanına ait planları listeler."""
    svc = PlanService(db)
    plans, total = await svc.list_by_workspace(workspace.id, page=page, size=size)
    return PaginatedResponse(
        items=[PlanResponse.model_validate(p) for p in plans],
        total=total,
        page=page,
        size=size,
    )


@router.get("/{plan_id}", response_model=PlanResponse)
async def get_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    workspace: Workspace = Depends(get_current_workspace),
) -> PlanResponse:
    """Plan detayını döner."""
    svc = PlanService(db)
    plan = await svc.get_by_id(plan_id, workspace_id=workspace.id)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan bulunamadı")
    return PlanResponse.model_validate(plan)
