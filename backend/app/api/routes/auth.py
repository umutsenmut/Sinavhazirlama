from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    verify_password,
)
from app.models.user import User
from app.schemas.common import TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.user_service import UserService
from app.services.workspace_service import WorkspaceService

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Yeni kullanıcı kaydı oluşturur."""
    user_svc = UserService(db)
    existing = await user_svc.get_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu e-posta adresi zaten kayıtlı",
        )

    ws_svc = WorkspaceService(db)
    workspace = await ws_svc.create(name=payload.full_name, owner_email=payload.email)
    user = await user_svc.create(payload, workspace_id=workspace.id)
    await ws_svc.set_owner(workspace, user.id)
    return UserResponse.model_validate(user)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """E-posta ve şifre ile giriş yapar, JWT token döner."""
    user_svc = UserService(db)
    user = await user_svc.get_by_email(payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hesabınız deaktif edilmiş",
        )

    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """Refresh token kullanarak yeni access token üretir."""
    payload = decode_refresh_token(refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş refresh token",
        )
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Geçersiz token")

    user_svc = UserService(db)
    user = await user_svc.get_by_id(int(user_id))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı bulunamadı")

    new_access = create_access_token(subject=str(user.id))
    new_refresh = create_refresh_token(subject=str(user.id))
    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(current_user: User = Depends(get_current_user)) -> dict[str, str]:
    """Oturumu kapatır (istemci tarafında token silinmeli)."""
    # Stateless JWT - token kara listeye eklenebilir (gelecekte Redis ile)
    return {"mesaj": "Başarıyla çıkış yapıldı"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Mevcut kullanıcı bilgilerini döner."""
    return UserResponse.model_validate(current_user)
