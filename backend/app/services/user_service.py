from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate


class UserService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def create(self, data: UserCreate, workspace_id: int | None = None) -> User:
        user = User(
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            school_name=data.school_name,
            workspace_id=workspace_id,
            is_active=True,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def update(self, user: User, full_name: str | None = None, school_name: str | None = None) -> User:
        if full_name is not None:
            user.full_name = full_name
        if school_name is not None:
            user.school_name = school_name
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def deactivate(self, user: User) -> User:
        user.is_active = False
        await self.db.flush()
        return user

    async def authenticate(self, email: str, password: str) -> User | None:
        from app.core.security import verify_password
        user = await self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user
