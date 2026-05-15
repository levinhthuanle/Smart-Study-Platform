from sqlalchemy import ForeignKey, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Channel(Base):
	__tablename__ = "channels"

	channel_id: Mapped[int] = mapped_column(
		Integer,
		primary_key=True,
		index=True,
	)

	workspace_id: Mapped[int] = mapped_column(
		ForeignKey("workspaces.workspace_id"),
		nullable=False,
		index=True,
	)

	name: Mapped[str] = mapped_column(
		String(255),
		nullable=False,
	)

	description: Mapped[str | None] = mapped_column(
		String(500),
		nullable=True,
	)

	color: Mapped[str] = mapped_column(
		String(7),  # hex color code
		default="#3B82F6",  # default blue
		nullable=False,
	)

	created_by: Mapped[int] = mapped_column(
		ForeignKey("users.user_id"),
		nullable=False,
	)

	created_at: Mapped[TIMESTAMP] = mapped_column(
		TIMESTAMP(timezone=True),
		server_default=func.now(),
		nullable=False,
	)

	workspace = relationship(
		"Workspace",
		back_populates="channels",
	)

	creator = relationship(
		"User",
		back_populates="created_channels",
	)

	messages = relationship(
		"Message",
		back_populates="channel",
		cascade="all, delete-orphan",
	)
