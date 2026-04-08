from __future__ import annotations

import time

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()

_start_time = time.time()


class HealthResponse(BaseModel):
    durum: str
    uygulama: str
    versiyon: str


class StatusResponse(BaseModel):
    durum: str
    uygulama: str
    versiyon: str
    calisma_suresi_saniye: float
    debug: bool


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Uygulamanın çalışıp çalışmadığını kontrol eder."""
    return HealthResponse(
        durum="sağlıklı",
        uygulama=settings.APP_NAME,
        versiyon=settings.APP_VERSION,
    )


@router.get("/status", response_model=StatusResponse)
async def status_check() -> StatusResponse:
    """Uygulama durumu ve çalışma süresi bilgisini döner."""
    uptime = time.time() - _start_time
    return StatusResponse(
        durum="çalışıyor",
        uygulama=settings.APP_NAME,
        versiyon=settings.APP_VERSION,
        calisma_suresi_saniye=round(uptime, 2),
        debug=settings.DEBUG,
    )
