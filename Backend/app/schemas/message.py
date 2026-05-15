from datetime import datetime

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
	content: str = Field(
		min_length=1,
	)


class MessageUpdate(BaseModel):
	content: str | None = Field(
		default=None,
		min_length=1,
	)


class MessageResponse(BaseModel):
	message_id: int
	workspace_id: int
	sender_id: int
	content: str
	created_at: datetime

	model_config = {
		"from_attributes": True
	}
