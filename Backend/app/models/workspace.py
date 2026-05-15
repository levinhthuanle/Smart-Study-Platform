from sqlalchemy import String, Integer, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

class Workspace(Base):
    __tablename__ = "workspaces"
    
    workspace_id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )
    
    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id"),
        nullable=False,
    )
    
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    
    created_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
    )
    
    owner = relationship(
        "User",
        back_populates="owned_workspaces",
    )
    
    memberships = relationship(
        "WorkspaceMember",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    tasks = relationship(
        "Task",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )

    messages = relationship(
        "Message",
        back_populates="workspace",
        cascade="all, delete-orphan",
    )