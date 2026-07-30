from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,   # silently replace stale pooled connections
    pool_recycle=3600,    # recycle connections every hour
)
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,  # MANDATORY for async: prevents MissingGreenlet on lazy load
    class_=AsyncSession,
)

class Base(DeclarativeBase):
    pass
