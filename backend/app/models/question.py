from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    exam_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # test | text | tf | bosluk
    question_type: Mapped[str] = mapped_column(String(20), nullable=False, default="test")
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    # JSON encoded: list of strings for 'test', None for others
    options: Mapped[str | None] = mapped_column(Text, nullable=True)
    correct_answer: Mapped[str | None] = mapped_column(Text, nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    order_num: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    exam: Mapped["Exam"] = relationship("Exam", back_populates="questions")  # noqa: F821

    def __repr__(self) -> str:
        return f"<Question id={self.id} type={self.question_type} order={self.order_num}>"
