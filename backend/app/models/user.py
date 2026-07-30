from enum import Enum
from uuid import UUID, uuid4
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from .base import TimestampMixin

class UserRole(str, Enum):
    admin = "admin"
    member = "member"

class User(Base, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="admin")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
