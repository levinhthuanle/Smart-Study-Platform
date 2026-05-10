from datetime import datetime

from pydantic import BaseModel, Field


class WorkspaceBase(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=255,
    )


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )


class WorkspaceResponse(WorkspaceBase):
    workspace_id: int
    owner_id: int
    created_at: datetime

    model_config = {
        "from_attributes": True
    }
