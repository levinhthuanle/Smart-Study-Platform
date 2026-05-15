from fastapi import (
    APIRouter,
    Depends,
)

from app.core.depedencies import (
    get_current_user,
)

from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from fastapi import Path, HTTPException
from sqlalchemy.future import select


router = APIRouter(
    prefix="/api/users",
    tags=["users"],
)


@router.get("/me")
async def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return {
        "user_id": current_user.user_id,
        "email": current_user.email,
        "created_at": current_user.created_at,
    }


@router.get("/{user_id}")
async def get_user_by_id(
    user_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.user_id,
        "email": user.email,
        "created_at": user.created_at,
    }