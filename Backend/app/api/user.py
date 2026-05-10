from fastapi import (
    APIRouter,
    Depends,
)

from app.core.depedencies import (
    get_current_user,
)

from app.models.user import User


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