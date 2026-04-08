from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import (
    GeminiException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)
from app.db.session import engine
from app.db.base import Base
from app.api.routes import auth, exams, plans, materials, health

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Uygulama başlangıç ve kapanış olaylarını yönet."""
    logger.info("Uygulama başlatılıyor...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Veritabanı tabloları hazır.")
    yield
    logger.info("Uygulama kapatılıyor...")
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Türk öğretmenler için AI destekli sınav sorusu üretim platformu",
        docs_url="/api/docs" if settings.DEBUG else None,
        redoc_url="/api/redoc" if settings.DEBUG else None,
        openapi_url="/api/openapi.json" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Exception handlers
    @app.exception_handler(NotFoundException)
    async def not_found_handler(request: Request, exc: NotFoundException) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"hata": exc.message, "kod": "BULUNAMADI"},
        )

    @app.exception_handler(UnauthorizedException)
    async def unauthorized_handler(request: Request, exc: UnauthorizedException) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"hata": exc.message, "kod": "YETKİSİZ"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(ValidationException)
    async def validation_handler(request: Request, exc: ValidationException) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"hata": exc.message, "kod": "DOĞRULAMA_HATASI", "ayrıntılar": exc.details},
        )

    @app.exception_handler(GeminiException)
    async def gemini_handler(request: Request, exc: GeminiException) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"hata": exc.message, "kod": "AI_HATASI"},
        )

    @app.exception_handler(Exception)
    async def generic_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Beklenmeyen hata: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"hata": "Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.", "kod": "SUNUCU_HATASI"},
        )

    # Routers
    prefix = "/api/v1"
    app.include_router(health.router, prefix=prefix, tags=["Sağlık"])
    app.include_router(auth.router, prefix=f"{prefix}/auth", tags=["Kimlik Doğrulama"])
    app.include_router(exams.router, prefix=f"{prefix}/exams", tags=["Sınavlar"])
    app.include_router(plans.router, prefix=f"{prefix}/plans", tags=["Planlar"])
    app.include_router(materials.router, prefix=f"{prefix}/materials", tags=["Materyaller"])

    return app


app = create_app()
