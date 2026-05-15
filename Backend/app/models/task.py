from sqlalchemy import ForeignKey, Integer, String, Text, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Task(Base):
	__tablename__ = "tasks"

	task_id: Mapped[int] = mapped_column(
		Integer,
		primary_key=True,
		index=True,
	)

	workspace_id: Mapped[int] = mapped_column(
		ForeignKey("workspaces.workspace_id"),
		nullable=False,
	)

	title: Mapped[str] = mapped_column(
		String(255),
		nullable=False,
	)

	description: Mapped[str] = mapped_column(
		Text,
		nullable=False,
	)

	status: Mapped[str] = mapped_column(
		String(255),
		nullable=False,
	)

	assigned_to: Mapped[int] = mapped_column(
		ForeignKey("users.user_id"),
		nullable=False,
	)

	due_date: Mapped[TIMESTAMP] = mapped_column(
		TIMESTAMP(timezone=True),
		nullable=False,
	)

	updated_at: Mapped[TIMESTAMP] = mapped_column(
		TIMESTAMP(timezone=True),
		server_default=func.now(),
		onupdate=func.now(),
		nullable=False,
	)

	created_at: Mapped[TIMESTAMP] = mapped_column(
		TIMESTAMP(timezone=True),
		server_default=func.now(),
		nullable=False,
	)

	workspace = relationship(
		"Workspace",
		back_populates="tasks",
	)

	assignee = relationship(
		"User",
		back_populates="assigned_tasks",
	)
