from uuid import UUID, uuid4
from typing import TYPE_CHECKING
from sqlalchemy import String, ForeignKey, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from .base import TimestampMixin

if TYPE_CHECKING:
    from .tenant import Tenant


class MaterialMachinability(Base, TimestampMixin):
    __tablename__ = "material_machinability"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    material_name: Mapped[str] = mapped_column(String(255), nullable=False)
    cutting_speed_m_min: Mapped[float] = mapped_column(Float, nullable=False)  # V_c (m/min)
    feed_rate_mm_rev: Mapped[float] = mapped_column(Float, nullable=False)     # f (mm/rev)
    density_g_cm3: Mapped[float] = mapped_column(Float, nullable=False)        # Density (g/cm^3)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", foreign_keys=[tenant_id])
