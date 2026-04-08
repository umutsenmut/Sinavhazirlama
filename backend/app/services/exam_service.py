from __future__ import annotations

import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.exam import Exam
from app.models.question import Question
from app.schemas.exam import ExamCreate

logger = logging.getLogger(__name__)


class ExamService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, data: ExamCreate, workspace_id: int) -> Exam:
        exam = Exam(
            workspace_id=workspace_id,
            title=data.title,
            grade=data.grade,
            subject=data.subject,
            week_number=data.week_number,
            status="pending",
        )
        self.db.add(exam)
        await self.db.flush()
        # Reload with eager-loaded questions to avoid lazy-load outside greenlet
        return await self.get_by_id(exam.id)

    async def get_by_id(self, exam_id: int, workspace_id: int | None = None) -> Exam | None:
        query = (
            select(Exam)
            .options(selectinload(Exam.questions))
            .where(Exam.id == exam_id)
        )
        if workspace_id is not None:
            query = query.where(Exam.workspace_id == workspace_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self, workspace_id: int, page: int = 1, size: int = 20, week_number: int | None = None
    ) -> tuple[list[Exam], int]:
        base_filter = [Exam.workspace_id == workspace_id]
        if week_number is not None:
            base_filter.append(Exam.week_number == week_number)

        count_result = await self.db.execute(
            select(func.count(Exam.id)).where(*base_filter)
        )
        total = count_result.scalar_one()

        result = await self.db.execute(
            select(Exam)
            .options(selectinload(Exam.questions))
            .where(*base_filter)
            .order_by(Exam.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        return list(result.scalars().all()), total

    async def delete(self, exam_id: int, workspace_id: int) -> bool:
        exam = await self.get_by_id(exam_id, workspace_id=workspace_id)
        if not exam:
            return False
        await self.db.delete(exam)
        await self.db.flush()
        return True

    async def generate_questions(self, exam: Exam) -> Exam:
        """Gemini AI aracılığıyla sınav soruları üretir."""
        from app.services.gemini_service import GeminiService

        exam.status = "generating"
        await self.db.flush()

        try:
            gemini_svc = GeminiService()
            questions_data = await gemini_svc.generate_questions_for_exam(exam)

            # Mevcut soruları sil
            for q in exam.questions:
                await self.db.delete(q)
            await self.db.flush()

            # Yeni soruları kaydet
            for idx, qdata in enumerate(questions_data):
                question = Question(
                    exam_id=exam.id,
                    question_type=qdata.get("type", "test"),
                    question_text=qdata.get("question", ""),
                    options=str(qdata.get("options")) if qdata.get("options") else None,
                    correct_answer=str(qdata.get("correct_answer", "")),
                    points=int(qdata.get("points", 5)),
                    order_num=idx + 1,
                )
                self.db.add(question)

            exam.status = "completed"
        except Exception as exc:
            logger.error("Soru üretimi başarısız (exam_id=%s): %s", exam.id, exc)
            exam.status = "failed"
            raise

        await self.db.flush()
        # Reload with eager-loaded questions
        reloaded = await self.get_by_id(exam.id)
        return reloaded
