from pydantic import (
    BaseModel,
    EmailStr,
    field_validator,
)


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value, info):
        password = info.data.get("password")

        if password != value:
            raise ValueError("Passwords do not match")

        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    user_id: int
    email: EmailStr

    model_config = {
        "from_attributes": True
    }
