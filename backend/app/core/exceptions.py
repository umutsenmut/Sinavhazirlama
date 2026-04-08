from __future__ import annotations

from typing import Any


class AppException(Exception):
    """Tüm uygulama istisnalarının temel sınıfı."""

    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class NotFoundException(AppException):
    """İstenilen kaynak bulunamadığında fırlatılır."""

    def __init__(self, message: str = "İstenen kaynak bulunamadı") -> None:
        super().__init__(message)


class UnauthorizedException(AppException):
    """Kimlik doğrulama başarısız olduğunda fırlatılır."""

    def __init__(self, message: str = "Bu işlem için yetkiniz yok") -> None:
        super().__init__(message)


class ValidationException(AppException):
    """Giriş verisi doğrulama hatalarında fırlatılır."""

    def __init__(self, message: str, details: Any = None) -> None:
        self.details = details
        super().__init__(message)


class GeminiException(AppException):
    """Gemini API hatalarında fırlatılır."""

    def __init__(self, message: str = "Yapay zeka servisi şu anda kullanılamıyor") -> None:
        super().__init__(message)


class DriveException(AppException):
    """Google Drive API hatalarında fırlatılır."""

    def __init__(self, message: str = "Google Drive servisi şu anda kullanılamıyor") -> None:
        super().__init__(message)
