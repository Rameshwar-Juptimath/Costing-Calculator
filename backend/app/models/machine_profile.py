from uuid import UUID, uuid4
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Numeric, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from .base import TimestampMixin

if TYPE_CHECKING:
    from .tenant import Tenant
    from .cost_estimate import CostEstimate

class MachineProfile(Base, TimestampMixin):
    __tablename__ = "machine_profiles"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    machine_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hourly_rate_inr: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    operator_rate_inr: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", foreign_keys=[tenant_id])
    routing_steps: Mapped[list["ProcessRoutingStep"]] = relationship("ProcessRoutingStep", back_populates="machine_profile")


class ProcessRoutingStep(Base, TimestampMixin):
    __tablename__ = "process_routing_steps"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    estimate_id: Mapped[UUID] = mapped_column(ForeignKey("cost_estimates.id", ondelete="CASCADE"), nullable=False)
    machine_profile_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("machine_profiles.id", ondelete="SET NULL"), nullable=True)
    sequence_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    setup_time_mins: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    cycle_time_mins: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)

    # Relationships
    estimate: Mapped["CostEstimate"] = relationship("CostEstimate", back_populates="routing_steps")
    machine_profile: Mapped[Optional["MachineProfile"]] = relationship("MachineProfile", back_populates="routing_steps")
