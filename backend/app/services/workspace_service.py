from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace


class WorkspaceService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_id(self, workspace_id: int) -> Workspace | None:
        result = await self.db.execute(select(Workspace).where(Workspace.id == workspace_id))
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Workspace | None:
        result = await self.db.execute(select(Workspace).where(Workspace.slug == slug))
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: int) -> list[Workspace]:
        from app.models.user import User
        result = await self.db.execute(
            select(Workspace).join(User, User.workspace_id == Workspace.id).where(User.id == user_id)
        )
        return list(result.scalars().all())

    async def create(self, name: str, owner_email: str) -> Workspace:
        base_slug = Workspace.make_slug(name)
        slug = base_slug
        # Benzersiz slug sağla
        counter = 1
        while await self.get_by_slug(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        workspace = Workspace(name=name, slug=slug, owner_id=None)
        self.db.add(workspace)
        await self.db.flush()
        await self.db.refresh(workspace)
        return workspace

    async def set_owner(self, workspace: Workspace, owner_id: int) -> Workspace:
        workspace.owner_id = owner_id
        await self.db.flush()
        await self.db.refresh(workspace)
        return workspace

    async def update_name(self, workspace: Workspace, new_name: str) -> Workspace:
        workspace.name = new_name
        await self.db.flush()
        await self.db.refresh(workspace)
        return workspace
