from sqlalchemy import ForeignKey, Integer, Text, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Message(Base):
	__tablename__ = "messages"

	message_id: Mapped[int] = mapped_column(
		Integer,
		primary_key=True,
		index=True,
	)

	workspace_id: Mapped[int] = mapped_column(
		ForeignKey("workspaces.workspace_id"),
		nullable=False,
	)

	sender_id: Mapped[int] = mapped_column(
		ForeignKey("users.user_id"),
		nullable=False,
	)

	content: Mapped[str] = mapped_column(
		Text,
		nullable=False,
	)

	created_at: Mapped[TIMESTAMP] = mapped_column(
		TIMESTAMP(timezone=True),
		server_default=func.now(),
		nullable=False,
	)

	workspace = relationship(
		"Workspace",
		back_populates="messages",
	)

	sender = relationship(
		"User",
		back_populates="sent_messages",
	)
