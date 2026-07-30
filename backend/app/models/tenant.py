from uuid import UUID, uuid4
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from .base import TimestampMixin

class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
