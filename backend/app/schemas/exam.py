from __future__ import annotations

import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.question import QuestionResponse


class ExamCreate(BaseModel):
    title: str
    grade: str
    subject: str
    week_number: int | None = None
    question_count: int = 20
    question_types: list[str] = ["test"]

    @field_validator("grade")
    @classmethod
    def validate_grade(cls, v: str) -> str:
        valid = {str(i) for i in range(1, 13)}
        if v not in valid:
            raise ValueError("Sınıf 1-12 arasında olmalıdır")
        return v

    @field_validator("question_types", mode="before")
    @classmethod
    def validate_types(cls, v: list[str]) -> list[str]:
        allowed = {"test", "text", "tf", "bosluk"}
        for t in v:
            if t not in allowed:
                raise ValueError(f"Geçersiz soru tipi: {t}. İzin verilenler: {allowed}")
        return v


class ExamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    title: str
    grade: str
    subject: str
    week_number: int | None
    status: str
    created_at: datetime.datetime
    questions: list[QuestionResponse] = []


class ExamListResponse(BaseModel):
    items: list[ExamResponse]
    total: int
    page: int
    size: int
