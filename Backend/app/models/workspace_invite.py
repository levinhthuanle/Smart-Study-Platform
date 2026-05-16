from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class WorkspaceInvite(Base):
    __tablename__ = "workspace_invites"

    workspace_invite_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.workspace_id"),
        nullable=False,
    )

    token: Mapped[str] = mapped_column(
        String(128),
        unique=True,
        nullable=False,
        index=True,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False,
    )

    accepted_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

    accepted_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

    workspace = relationship("Workspace")
    creator = relationship("User", foreign_keys=[created_by])
    accepter = relationship("User", foreign_keys=[accepted_by])