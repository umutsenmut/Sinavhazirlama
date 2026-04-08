from __future__ import annotations

import datetime

from pydantic import BaseModel, ConfigDict


class PlanUpload(BaseModel):
    title: str | None = None


class PlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    title: str
    file_path: str | None
    parsing_status: str
    parsed_content: str | None
    created_at: datetime.datetime
