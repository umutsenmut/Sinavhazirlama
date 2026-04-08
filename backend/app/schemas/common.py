from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorResponse(BaseModel):
    hata: str
    kod: str
    ayrıntılar: object | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
