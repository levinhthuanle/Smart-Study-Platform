from datetime import datetime
from typing import Literal

from pydantic import BaseModel


WorkspaceMemberRole = Literal["member", "admin"]


class WorkspaceMemberCreate(BaseModel):
    user_id: int
    role: WorkspaceMemberRole = "member"


class WorkspaceMemberUpdate(BaseModel):
    role: WorkspaceMemberRole


class WorkspaceMemberResponse(BaseModel):
    workspace_member_id: int
    workspace_id: int
    user_id: int
    role: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
