from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Şifreyi bcrypt ile hashler."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Düz şifreyi hashlenmiş şifreyle karşılaştırır."""
    return pwd_context.verify(plain_password, hashed_password)


def _create_token(subject: str, expires_delta: timedelta, token_type: str) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    payload: dict[str, Any] = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": token_type,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(subject: str) -> str:
    """Erişim token'ı oluşturur."""
    return _create_token(
        subject=subject,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type="access",
    )


def create_refresh_token(subject: str) -> str:
    """Yenileme token'ı oluşturur."""
    return _create_token(
        subject=subject,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        token_type="refresh",
    )


def _decode_token(token: str, expected_type: str) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != expected_type:
            return None
        return payload
    except JWTError:
        return None


def decode_access_token(token: str) -> dict[str, Any] | None:
    """Erişim token'ını çözümler."""
    return _decode_token(token, "access")


def decode_refresh_token(token: str) -> dict[str, Any] | None:
    """Yenileme token'ını çözümler."""
    return _decode_token(token, "refresh")
