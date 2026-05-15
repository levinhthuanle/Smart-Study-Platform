from datetime import datetime

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
	title: str = Field(
		min_length=1,
		max_length=255,
	)
	description: str = Field(
		min_length=1,
	)
	status: str = Field(
		min_length=1,
		max_length=255,
	)
	assigned_to: int
	due_date: datetime


class TaskCreate(TaskBase):
	pass


class TaskUpdate(BaseModel):
	title: str | None = Field(
		default=None,
		min_length=1,
		max_length=255,
	)
	description: str | None = Field(
		default=None,
		min_length=1,
	)
	status: str | None = Field(
		default=None,
		min_length=1,
		max_length=255,
	)
	assigned_to: int | None = None
	due_date: datetime | None = None


class TaskResponse(TaskBase):
	task_id: int
	workspace_id: int
	updated_at: datetime
	created_at: datetime

	model_config = {
		"from_attributes": True
	}
