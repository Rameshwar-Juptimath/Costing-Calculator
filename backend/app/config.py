import os
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

# Search for .env file starting from root directory down to backend directory
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILES = [str(ROOT_DIR / ".env"), str(BACKEND_DIR / ".env"), ".env"]

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://costing_user:costing_pass_123@localhost:5432/costing_db"
    sync_database_url: str = "postgresql+psycopg2://costing_user:costing_pass_123@localhost:5432/costing_db"
    jwt_secret_key: str = "5bc546819e54e30f554eb6d279bb8c5a6a4e7ca8190fdf6439c51d3719c21f0e"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    max_upload_size_mb: int = 100
    upload_dir: str = "uploads"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    admin_email: str = "admin@example.com"
    admin_password: str = "Admin@123!"
    pro_admin_email: str = "pro_admin@example.com"
    pro_admin_password: str = "ProAdmin@123!"

    class Config:
        env_file = ENV_FILES
        extra = "ignore"

    def __init__(self, **values):
        super().__init__(**values)
        # If running outside Docker container, adapt hostname 'db' to 'localhost'
        if not os.path.exists("/.dockerenv"):
            if "@db:" in self.database_url:
                object.__setattr__(self, "database_url", self.database_url.replace("@db:", "@localhost:"))
            if "@db:" in self.sync_database_url:
                object.__setattr__(self, "sync_database_url", self.sync_database_url.replace("@db:", "@localhost:"))

@lru_cache
def get_settings() -> Settings:
    return Settings()
