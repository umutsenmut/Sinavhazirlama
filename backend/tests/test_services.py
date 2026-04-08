from __future__ import annotations

import json

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.services.user_service import UserService
from app.services.workspace_service import WorkspaceService
from app.services.exam_service import ExamService
from app.services.gemini_service import GeminiService
from app.schemas.user import UserCreate
from app.schemas.exam import ExamCreate


# ----- Security tests -----

def test_password_hash_and_verify() -> None:
    password = "GüçlüŞifre123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("YanlışŞifre", hashed)


def test_password_hash_unique() -> None:
    hashed1 = hash_password("aynisifre")
    hashed2 = hash_password("aynisifre")
    assert hashed1 != hashed2  # bcrypt her seferinde farklı salt kullanır


# ----- UserService tests -----

@pytest.mark.asyncio
async def test_create_user(test_db: AsyncSession, test_workspace) -> None:
    svc = UserService(test_db)
    payload = UserCreate(
        email="servis@test.com",
        password="TestSifre123",
        full_name="Servis Test",
    )
    user = await svc.create(payload, workspace_id=test_workspace.id)
    assert user.id is not None
    assert user.email == "servis@test.com"
    assert user.is_active is True


@pytest.mark.asyncio
async def test_get_user_by_email(test_db: AsyncSession, test_user) -> None:
    svc = UserService(test_db)
    found = await svc.get_by_email("ogretmen@test.com")
    assert found is not None
    assert found.id == test_user.id


@pytest.mark.asyncio
async def test_get_user_by_email_not_found(test_db: AsyncSession) -> None:
    svc = UserService(test_db)
    found = await svc.get_by_email("yok@test.com")
    assert found is None


@pytest.mark.asyncio
async def test_authenticate_user(test_db: AsyncSession, test_user) -> None:
    svc = UserService(test_db)
    authenticated = await svc.authenticate("ogretmen@test.com", "TestSifre123")
    assert authenticated is not None
    assert authenticated.id == test_user.id


@pytest.mark.asyncio
async def test_authenticate_user_wrong_password(test_db: AsyncSession, test_user) -> None:
    svc = UserService(test_db)
    result = await svc.authenticate("ogretmen@test.com", "YanlışŞifre")
    assert result is None


# ----- WorkspaceService tests -----

@pytest.mark.asyncio
async def test_create_workspace(test_db: AsyncSession) -> None:
    svc = WorkspaceService(test_db)
    ws = await svc.create(name="Yeni Okul", owner_email="owner@test.com")
    assert ws.id is not None
    assert ws.name == "Yeni Okul"
    assert ws.slug == "yeni-okul"


@pytest.mark.asyncio
async def test_workspace_slug_unique(test_db: AsyncSession) -> None:
    svc = WorkspaceService(test_db)
    ws1 = await svc.create(name="Aynı İsim", owner_email="a@test.com")
    ws2 = await svc.create(name="Aynı İsim", owner_email="b@test.com")
    assert ws1.slug != ws2.slug


# ----- ExamService tests -----

@pytest.mark.asyncio
async def test_create_exam_service(test_db: AsyncSession, test_workspace) -> None:
    svc = ExamService(test_db)
    payload = ExamCreate(title="Test Sınavı", grade="6", subject="Matematik")
    exam = await svc.create(payload, workspace_id=test_workspace.id)
    assert exam.id is not None
    assert exam.status == "pending"
    assert exam.grade == "6"


@pytest.mark.asyncio
async def test_delete_exam_service(test_db: AsyncSession, test_workspace) -> None:
    svc = ExamService(test_db)
    payload = ExamCreate(title="Silinecek", grade="9", subject="Fizik")
    exam = await svc.create(payload, workspace_id=test_workspace.id)
    exam_id = exam.id

    deleted = await svc.delete(exam_id, workspace_id=test_workspace.id)
    assert deleted is True

    not_found = await svc.get_by_id(exam_id, workspace_id=test_workspace.id)
    assert not_found is None


# ----- GeminiService tests -----

def test_gemini_validate_questions_valid() -> None:
    svc = GeminiService()
    raw = [
        {
            "type": "test",
            "question": "Türkiye'nin başkenti neresidir?",
            "options": ["A) İstanbul", "B) Ankara", "C) İzmir", "D) Bursa"],
            "correct_answer": "B",
            "points": 5,
        },
        {
            "type": "tf",
            "question": "Güneş bir yıldızdır.",
            "options": ["Doğru", "Yanlış"],
            "correct_answer": "Doğru",
            "points": 5,
        },
    ]
    validated = svc._validate_questions(raw)
    assert len(validated) == 2
    assert validated[0]["type"] == "test"
    opts = json.loads(validated[0]["options"])
    assert len(opts) == 4


def test_gemini_validate_questions_filters_empty() -> None:
    svc = GeminiService()
    raw = [
        {"type": "test", "question": "", "options": [], "correct_answer": "A"},
        {"type": "text", "question": "Geçerli soru", "options": None, "correct_answer": "Cevap"},
    ]
    validated = svc._validate_questions(raw)
    assert len(validated) == 1
    assert validated[0]["question"] == "Geçerli soru"


def test_gemini_validate_questions_clamps_points() -> None:
    svc = GeminiService()
    raw = [{"type": "test", "question": "Soru", "options": ["A", "B"], "correct_answer": "A", "points": 999}]
    validated = svc._validate_questions(raw)
    assert validated[0]["points"] == 20
