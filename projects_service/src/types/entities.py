from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class Project(BaseModel):
    """Project entity model"""
    id: str
    name: str
    description: str
    owner_id: str
    member_ids: list[str] = Field(default_factory=list)
    created_at: datetime
    last_modified_at: datetime

