from datetime import datetime

from pydantic import BaseModel, Field


class ChannelBase(BaseModel):
	name: str = Field(
		min_length=1,
		max_length=255,
	)

	description: str | None = Field(
		default=None,
		max_length=500,
	)

	color: str = Field(
		default="#3B82F6",
		pattern="^#[0-9A-Fa-f]{6}$",  # hex color validation
	)


class ChannelCreate(ChannelBase):
	pass


class ChannelUpdate(BaseModel):
	name: str | None = Field(
		default=None,
		min_length=1,
		max_length=255,
	)

	description: str | None = Field(
		default=None,
		max_length=500,
	)

	color: str | None = Field(
		default=None,
		pattern="^#[0-9A-Fa-f]{6}$",
	)


class ChannelResponse(ChannelBase):
	channel_id: int
	workspace_id: int
	created_by: int
	created_at: datetime

	model_config = {
		"from_attributes": True,
	}
