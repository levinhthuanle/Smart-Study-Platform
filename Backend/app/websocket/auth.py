from jose import JWTError, jwt

from app.core.config import settings


def get_user_id_from_token(token: str) -> int:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if user_id is None or token_type != "access":
            raise ValueError("Invalid token")

        return int(user_id)

    except (JWTError, ValueError) as exc:
        raise ValueError("Invalid token") from exc