from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    database_url: str
    sync_database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    max_upload_size_mb: int = 100
    upload_dir: str = "/app/uploads"
    allowed_origins: str = "http://localhost:3000"
    admin_email: str
    admin_password: str
    pro_admin_email: str = "pro_admin@example.com"
    pro_admin_password: str = "ProAdmin@123!"

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache
def get_settings() -> Settings:
    return Settings()
