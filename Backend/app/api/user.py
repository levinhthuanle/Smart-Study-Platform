from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Path,
)

from app.core.depedencies import (
    get_current_user,
)

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from sqlalchemy.future import select


router = APIRouter(
    prefix="/api/users",
    tags=["users"],
)


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):
    return _serialize_user(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if payload.username is not None:
        current_user.username = payload.username

    if payload.avt_url is not None:
        current_user.avt_url = payload.avt_url

    await db.commit()
    await db.refresh(current_user)

    return _serialize_user(current_user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.user_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return _serialize_user(user)


def _serialize_user(user: User):
    return {
        "user_id": user.user_id,
        "email": user.email,
        "username": user.username,
        "avt_url": user.avt_url,
        "created_at": user.created_at,
    }