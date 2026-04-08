from __future__ import annotations

import json
import logging
import re
from typing import Any

import google.generativeai as genai
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings
from app.core.exceptions import GeminiException

logger = logging.getLogger(__name__)

_client_initialized = False


def _get_model() -> genai.GenerativeModel:
    global _client_initialized
    if not _client_initialized:
        if not settings.GEMINI_API_KEY:
            raise GeminiException("Gemini API anahtarı yapılandırılmamış")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _client_initialized = True
    return genai.GenerativeModel(settings.GEMINI_MODEL)


def _is_retryable(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return any(k in msg for k in ("429", "503", "quota", "rate", "unavailable", "overloaded"))


@retry(
    retry=retry_if_exception_type(Exception),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=2, min=4, max=30),
    reraise=False,
)
async def _call_gemini_with_retry(prompt: str) -> str:
    """Gemini API'sini üstel geri çekilme ile çağırır."""
    try:
        model = _get_model()
        response = model.generate_content(prompt)
        if not response.text:
            raise GeminiException("Gemini boş yanıt döndürdü")
        return response.text
    except GeminiException:
        raise
    except Exception as exc:
        if _is_retryable(exc):
            logger.warning("Gemini oran sınırına ulaşıldı, yeniden deneniyor: %s", exc)
            raise
        logger.error("Gemini API hatası: %s", exc)
        raise GeminiException(f"Yapay zeka servisi hatası: {exc}") from exc


async def generate_content(prompt: str) -> str:
    """Gemini API'den metin üretir. Hata durumunda Türkçe mesaj fırlatır."""
    try:
        return await _call_gemini_with_retry(prompt)
    except RetryError as exc:
        raise GeminiException("Yapay zeka servisi şu anda meşgul. Lütfen birkaç dakika sonra tekrar deneyin.") from exc
    except GeminiException:
        raise
    except Exception as exc:
        raise GeminiException("Yapay zeka servisiyle iletişim kurulamadı.") from exc


def extract_json_from_response(text: str) -> Any:
    """Gemini yanıtından JSON bloğunu ayıklar ve çözümler."""
    # Önce ```json ... ``` bloğunu ara
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, re.IGNORECASE)
    if match:
        json_str = match.group(1).strip()
    else:
        # Direkt JSON olabilir
        json_str = text.strip()

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        # Son çare: ilk { veya [ konumundan itibaren çözümlemeyi dene
        start = min(
            (json_str.find(c) for c in ["{", "["] if json_str.find(c) != -1),
            default=-1,
        )
        if start != -1:
            try:
                return json.loads(json_str[start:])
            except json.JSONDecodeError:
                pass
    raise GeminiException("Yapay zeka yanıtı beklenen formatta değil. Lütfen tekrar deneyin.")
