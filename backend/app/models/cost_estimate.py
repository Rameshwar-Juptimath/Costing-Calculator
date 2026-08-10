from uuid import UUID, uuid4
from decimal import Decimal
from typing import Optional, TYPE_CHECKING, List
from sqlalchemy import String, ForeignKey, Numeric, Integer
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from .base import TimestampMixin

if TYPE_CHECKING:
    from .machine_profile import ProcessRoutingStep

class CostEstimate(Base, TimestampMixin):
    __tablename__ = "cost_estimates"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False, index=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    quote_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    quote_ref: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    quote_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
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

    # Relationships
    routing_steps: Mapped[List["ProcessRoutingStep"]] = relationship(
        "ProcessRoutingStep",
        back_populates="estimate",
        cascade="all, delete-orphan",
        order_by="ProcessRoutingStep.sequence_order"
    )
