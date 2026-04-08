from __future__ import annotations

import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    school_name: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Şifre en az 8 karakter olmalıdır")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        if len(v.strip()) < 2:
            raise ValueError("Ad Soyad en az 2 karakter olmalıdır")
        return v.strip()


class UserUpdate(BaseModel):
    full_name: str | None = None
    school_name: str | None = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    school_name: str | None
    workspace_id: int | None
    is_active: bool
    created_at: datetime.datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str
