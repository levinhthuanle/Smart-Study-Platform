from sqlalchemy import ForeignKey, String, Integer, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.db.database import Base

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    workspace_member_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    workspace_id: Mapped[int] = mapped_column(
        ForeignKey("workspaces.workspace_id"),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    created_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
    )
    
    workspace = relationship(
        "Workspace",
        back_populates="memberships",
    )
    
    user = relationship(
        "User",
        back_populates="workspace_memberships",
    )