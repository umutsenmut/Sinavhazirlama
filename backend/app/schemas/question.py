from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    exam_id: int
    question_type: str
    question_text: str
    options: str | None
    correct_answer: str | None
    points: int
    order_num: int
