from uuid import UUID, uuid4
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from .base import TimestampMixin

class CostEstimate(Base, TimestampMixin):
    __tablename__ = "cost_estimates"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255))
    file_type: Mapped[str] = mapped_column(String(10))  # 'step' or 'dxf'
    geometry_data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    direct_cost: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    overhead_cost: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    commercials: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    grand_total: Mapped[Optional[Decimal]] = mapped_column(Numeric(15, 4), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    tier_applied: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    mesh_file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
