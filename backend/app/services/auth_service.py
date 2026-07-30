"""
auth_service.py — JWT token creation/decoding + password hashing.

Libraries:
  - PyJWT (not python-jose which is unmaintained)
  - pwdlib[argon2] (not passlib which is not installed)
"""
import jwt
from datetime import datetime, timedelta, timezone

from pwdlib import PasswordHash

from app.config import get_settings

settings = get_settings()
password_hash = PasswordHash.recommended()


def hash_password(plain: str) -> str:
    return password_hash.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_access_token_expire_minutes
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT. Always specify algorithms= to prevent
    algorithm confusion attacks (e.g. RS256 → HS256 substitution).
    """
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )
