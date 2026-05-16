from datetime import datetime

from pydantic import BaseModel


class WorkspaceInviteResponse(BaseModel):
    workspace_invite_id: int
    workspace_id: int
    workspace_name: str
    token: str
    invite_path: str
    created_at: datetime
    expires_at: datetime | None = None


class WorkspaceInvitePreviewResponse(BaseModel):
    workspace_invite_id: int
    workspace_id: int
    workspace_name: str
    token: str
    expires_at: datetime | None = None
    accepted_at: datetime | None = None
    is_expired: bool = False
    is_used: bool = False