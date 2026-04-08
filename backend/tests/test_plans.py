from __future__ import annotations

import io

import pytest
from httpx import AsyncClient


def _make_docx_bytes(content: str = "Test içerik") -> bytes:
    """Test için basit bir DOCX bayt dizisi üretir."""
    import docx

    doc = docx.Document()
    doc.add_paragraph(content)
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)
    return buf.read()


@pytest.mark.asyncio
async def test_upload_plan(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    docx_bytes = _make_docx_bytes("5. Sınıf Türkçe Yıllık Planı\nKazanım 1: Okuma becerisi\nKazanım 2: Yazma becerisi")

    response = await test_client.post(
        "/api/v1/plans",
        headers=auth_headers,
        files={
            "file": (
                "yillik_plan.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "yillik_plan"
    assert data["parsing_status"] in ("completed", "failed")
    assert "id" in data


@pytest.mark.asyncio
async def test_upload_plan_wrong_format(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.post(
        "/api/v1/plans",
        headers=auth_headers,
        files={"file": ("plan.pdf", b"%PDF fake content", "application/pdf")},
    )
    assert response.status_code == 415


@pytest.mark.asyncio
async def test_list_plans(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.get("/api/v1/plans", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_get_plan_not_found(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.get("/api/v1/plans/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_plans_require_auth(test_client: AsyncClient) -> None:
    response = await test_client.get("/api/v1/plans")
    assert response.status_code == 403
