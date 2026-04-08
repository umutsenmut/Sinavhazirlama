from __future__ import annotations

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.exam import Exam


@pytest.mark.asyncio
async def test_create_exam(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.post(
        "/api/v1/exams",
        json={
            "title": "1. Dönem 1. Yazılı",
            "grade": "5",
            "subject": "Türkçe",
            "week_number": 6,
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "1. Dönem 1. Yazılı"
    assert data["grade"] == "5"
    assert data["subject"] == "Türkçe"
    assert data["status"] == "pending"
    assert "id" in data


@pytest.mark.asyncio
async def test_create_exam_invalid_grade(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.post(
        "/api/v1/exams",
        json={"title": "Test", "grade": "15", "subject": "Matematik"},
        headers=auth_headers,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_exams_empty(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.get("/api/v1/exams", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_get_exam(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    create_resp = await test_client.post(
        "/api/v1/exams",
        json={"title": "Test Sınavı", "grade": "7", "subject": "Fen Bilimleri"},
        headers=auth_headers,
    )
    exam_id = create_resp.json()["id"]

    response = await test_client.get(f"/api/v1/exams/{exam_id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == exam_id
    assert data["subject"] == "Fen Bilimleri"


@pytest.mark.asyncio
async def test_get_exam_not_found(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.get("/api/v1/exams/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_exam(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    create_resp = await test_client.post(
        "/api/v1/exams",
        json={"title": "Silinecek Sınav", "grade": "8", "subject": "Matematik"},
        headers=auth_headers,
    )
    exam_id = create_resp.json()["id"]

    del_resp = await test_client.delete(f"/api/v1/exams/{exam_id}", headers=auth_headers)
    assert del_resp.status_code == 200

    get_resp = await test_client.get(f"/api/v1/exams/{exam_id}", headers=auth_headers)
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_exam_not_found(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.delete("/api/v1/exams/99999", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_exams_require_auth(test_client: AsyncClient) -> None:
    response = await test_client.get("/api/v1/exams")
    assert response.status_code == 403
