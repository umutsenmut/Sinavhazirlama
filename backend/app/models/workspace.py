from __future__ import annotations

import datetime
import re

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    owner_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    owner: Mapped["User | None"] = relationship(  # noqa: F821
        "User", foreign_keys=[owner_id], primaryjoin="Workspace.owner_id == User.id"
    )
    members: Mapped[list["User"]] = relationship(  # noqa: F821
        "User", foreign_keys="User.workspace_id", back_populates="workspace"
    )
    plans: Mapped[list["Plan"]] = relationship(  # noqa: F821
        "Plan", back_populates="workspace", cascade="all, delete-orphan"
    )
    exams: Mapped[list["Exam"]] = relationship(  # noqa: F821
        "Exam", back_populates="workspace", cascade="all, delete-orphan"
    )

    @staticmethod
    def make_slug(name: str) -> str:
        """İsimden URL dostu slug üretir."""
        slug = name.lower().strip()
        slug = re.sub(r"[ğ]", "g", slug)
        slug = re.sub(r"[ü]", "u", slug)
        slug = re.sub(r"[ş]", "s", slug)
        slug = re.sub(r"[ı]", "i", slug)
        slug = re.sub(r"[ö]", "o", slug)
        slug = re.sub(r"[ç]", "c", slug)
        slug = re.sub(r"[^a-z0-9]+", "-", slug)
        slug = slug.strip("-")
        return slug or "workspace"

    def __repr__(self) -> str:
        return f"<Workspace id={self.id} slug={self.slug}>"
