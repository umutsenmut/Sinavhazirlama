from __future__ import annotations

import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    workspace_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    grade: Mapped[str] = mapped_column(String(10), nullable=False)
    subject: Mapped[str] = mapped_column(String(100), nullable=False)
    week_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # pending | generating | completed | failed
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="exams")  # noqa: F821
    questions: Mapped[list["Question"]] = relationship(  # noqa: F821
        "Question", back_populates="exam", cascade="all, delete-orphan", order_by="Question.order_num"
    )

    def __repr__(self) -> str:
        return f"<Exam id={self.id} title={self.title!r} status={self.status}>"
