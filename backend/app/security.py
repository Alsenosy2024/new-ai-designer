from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import (
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return pwd_context.verify(password, hashed_password)


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    expire_minutes = expires_minutes or JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=expire_minutes)
    payload = {"sub": subject, "iat": now, "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])


def get_token_expiry_seconds(expires_minutes: int | None = None) -> int:
    expire_minutes = expires_minutes or JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    return int(expire_minutes * 60)
