from enum import Enum
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from .base import TimestampMixin

class TierName(str, Enum):
    basic = "Basic"
    pro = "Pro"

class SubscriptionTier(Base):
    __tablename__ = "subscription_tiers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)

class TenantSubscription(Base, TimestampMixin):
    __tablename__ = "tenant_subscriptions"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), unique=True)
    tier_id: Mapped[int] = mapped_column(ForeignKey("subscription_tiers.id"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    valid_until: Mapped[Optional[datetime]] = mapped_column(nullable=True)

class PlanFeature(Base):
    __tablename__ = "plan_features"
    id: Mapped[int] = mapped_column(primary_key=True)
    tier_id: Mapped[int] = mapped_column(ForeignKey("subscription_tiers.id"), unique=True)
    can_access_direct_cost: Mapped[bool] = mapped_column(Boolean, default=True)
    can_access_overhead_cost: Mapped[bool] = mapped_column(Boolean, default=False)
    can_access_tax: Mapped[bool] = mapped_column(Boolean, default=False)
    can_access_profit_margin: Mapped[bool] = mapped_column(Boolean, default=False)
