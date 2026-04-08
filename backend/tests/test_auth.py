from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "yeni@test.com",
            "password": "GucluSifre123",
            "full_name": "Yeni Öğretmen",
            "school_name": "Yeni Okul",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "yeni@test.com"
    assert data["full_name"] == "Yeni Öğretmen"
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(test_client: AsyncClient, test_user) -> None:
    response = await test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "ogretmen@test.com",
            "password": "BaskaBirSifre123",
            "full_name": "Başka Öğretmen",
        },
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "zayif@test.com",
            "password": "123",
            "full_name": "Zayıf Sifre",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(test_client: AsyncClient, test_user) -> None:
    response = await test_client.post(
        "/api/v1/auth/login",
        json={"email": "ogretmen@test.com", "password": "TestSifre123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(test_client: AsyncClient, test_user) -> None:
    response = await test_client.post(
        "/api/v1/auth/login",
        json={"email": "ogretmen@test.com", "password": "YanlisŞifre"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/v1/auth/login",
        json={"email": "yok@test.com", "password": "HerhangiSifre123"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(test_client: AsyncClient, test_user) -> None:
    login_resp = await test_client.post(
        "/api/v1/auth/login",
        json={"email": "ogretmen@test.com", "password": "TestSifre123"},
    )
    refresh_token = login_resp.json()["refresh_token"]

    response = await test_client.post(
        "/api/v1/auth/refresh",
        params={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_get_me_authenticated(test_client: AsyncClient, auth_headers: dict, test_user) -> None:
    response = await test_client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "ogretmen@test.com"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(test_client: AsyncClient) -> None:
    response = await test_client.get("/api/v1/auth/me")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_logout(test_client: AsyncClient, auth_headers: dict) -> None:
    response = await test_client.post("/api/v1/auth/logout", headers=auth_headers)
    assert response.status_code == 200
