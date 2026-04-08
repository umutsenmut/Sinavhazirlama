from __future__ import annotations

from typing import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.models.workspace import Workspace
from app.core.security import hash_password

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture(scope="session")
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()


@pytest_asyncio.fixture
async def test_db(setup_database) -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def test_client(test_db: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_workspace(test_db: AsyncSession) -> Workspace:
    workspace = Workspace(name="Test Okulu", slug="test-okulu")
    test_db.add(workspace)
    await test_db.flush()
    await test_db.refresh(workspace)
    return workspace


@pytest_asyncio.fixture
async def test_user(test_db: AsyncSession, test_workspace: Workspace) -> User:
    user = User(
        email="ogretmen@test.com",
        password_hash=hash_password("TestSifre123"),
        full_name="Test Öğretmen",
        school_name="Test Ortaokulu",
        workspace_id=test_workspace.id,
        is_active=True,
    )
    test_db.add(user)
    await test_db.flush()
    test_workspace.owner_id = user.id
    await test_db.flush()
    await test_db.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(test_client: AsyncClient, test_user: User) -> dict[str, str]:
    response = await test_client.post(
        "/api/v1/auth/login",
        json={"email": "ogretmen@test.com", "password": "TestSifre123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
