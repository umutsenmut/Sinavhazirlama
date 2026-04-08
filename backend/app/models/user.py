from __future__ import annotations

import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    school_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    workspace_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    workspace: Mapped["Workspace | None"] = relationship(  # noqa: F821
        "Workspace", foreign_keys=[workspace_id], back_populates="members"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
