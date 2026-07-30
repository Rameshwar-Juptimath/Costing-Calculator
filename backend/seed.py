"""
seed.py — Bootstrap initial database data.

Run once after migrations:
    python seed.py

Creates:
  - Basic and Pro subscription tiers
  - Plan features for each tier (per spec)
  - A demo tenant
  - An admin user linked to the demo tenant on Basic tier
"""
import asyncio

from pwdlib import PasswordHash
from sqlalchemy import select

from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models.subscription import (
    PlanFeature,
    SubscriptionTier,
    TenantSubscription,
    TierName,
)
from app.models.tenant import Tenant
from app.models.user import User, UserRole

settings = get_settings()
password_hash = PasswordHash.recommended()


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        # ── Check if already seeded ────────────────────────────────────────
        existing = await session.execute(select(SubscriptionTier).limit(1))
        if existing.scalar_one_or_none() is not None:
            print("Database already seeded. Skipping.")
            return

        # ── 1. Subscription Tiers ──────────────────────────────────────────
        basic_tier = SubscriptionTier(name=TierName.basic.value)
        pro_tier = SubscriptionTier(name=TierName.pro.value)
        session.add_all([basic_tier, pro_tier])
        await session.flush()

        # ── 2. Plan Features (exact spec from brief) ───────────────────────
        basic_features = PlanFeature(
            tier_id=basic_tier.id,
            can_access_direct_cost=True,
            can_access_overhead_cost=False,
            can_access_tax=False,
            can_access_profit_margin=False,
        )
        pro_features = PlanFeature(
            tier_id=pro_tier.id,
            can_access_direct_cost=True,
            can_access_overhead_cost=True,
            can_access_tax=True,
            can_access_profit_margin=True,
        )
        session.add_all([basic_features, pro_features])

        # ── 3. Demo Tenant ─────────────────────────────────────────────────
        tenant = Tenant(name="Demo Company", slug="demo")
        session.add(tenant)
        await session.flush()

        # ── 4. Tenant Subscription (Basic by default) ──────────────────────
        subscription = TenantSubscription(
            tenant_id=tenant.id,
            tier_id=basic_tier.id,
            is_active=True,
        )
        session.add(subscription)

        # ── 5. Admin User ──────────────────────────────────────────────────
        hashed_password = password_hash.hash(settings.admin_password)
        admin_user = User(
            tenant_id=tenant.id,
            email=settings.admin_email,
            hashed_password=hashed_password,
            role=UserRole.admin.value,
            is_active=True,
        )
        session.add(admin_user)

        await session.commit()
        print("✅ Seed completed successfully.")
        print(f"   Admin email:    {settings.admin_email}")
        print(f"   Tenant:         {tenant.name} (slug: {tenant.slug})")
        print(f"   Tier:           Basic")


if __name__ == "__main__":
    asyncio.run(seed())
