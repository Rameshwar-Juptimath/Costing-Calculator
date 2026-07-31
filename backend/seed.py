"""
seed.py — Bootstrap initial database data.

Run once after migrations:
    python seed.py

Creates:
  - Basic and Pro subscription tiers
  - Plan features for each tier (per spec)
  - A demo tenant on Basic tier with an admin user
  - A demo tenant on Pro tier with another admin user
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
    from app.database import engine, Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # ── 1. Subscription Tiers ──────────────────────────────────────────
        res_basic = await session.execute(
            select(SubscriptionTier).where(SubscriptionTier.name == TierName.basic.value)
        )
        basic_tier = res_basic.scalar_one_or_none()
        if not basic_tier:
            basic_tier = SubscriptionTier(name=TierName.basic.value)
            session.add(basic_tier)

        res_pro = await session.execute(
            select(SubscriptionTier).where(SubscriptionTier.name == TierName.pro.value)
        )
        pro_tier = res_pro.scalar_one_or_none()
        if not pro_tier:
            pro_tier = SubscriptionTier(name=TierName.pro.value)
            session.add(pro_tier)

        await session.flush()

        # ── 2. Plan Features ───────────────────────────────────────────────
        res_bf = await session.execute(
            select(PlanFeature).where(PlanFeature.tier_id == basic_tier.id)
        )
        if not res_bf.scalar_one_or_none():
            session.add(
                PlanFeature(
                    tier_id=basic_tier.id,
                    can_access_direct_cost=True,
                    can_access_overhead_cost=False,
                    can_access_tax=False,
                    can_access_profit_margin=False,
                )
            )

        res_pf = await session.execute(
            select(PlanFeature).where(PlanFeature.tier_id == pro_tier.id)
        )
        if not res_pf.scalar_one_or_none():
            session.add(
                PlanFeature(
                    tier_id=pro_tier.id,
                    can_access_direct_cost=True,
                    can_access_overhead_cost=True,
                    can_access_tax=True,
                    can_access_profit_margin=True,
                )
            )

        # ── 3. Basic Demo Tenant ───────────────────────────────────────────
        res_tenant = await session.execute(
            select(Tenant).where(Tenant.slug == "demo")
        )
        tenant = res_tenant.scalar_one_or_none()
        if not tenant:
            tenant = Tenant(name="Demo Company", slug="demo")
            session.add(tenant)
            await session.flush()

        res_sub = await session.execute(
            select(TenantSubscription).where(TenantSubscription.tenant_id == tenant.id)
        )
        if not res_sub.scalar_one_or_none():
            session.add(
                TenantSubscription(
                    tenant_id=tenant.id,
                    tier_id=basic_tier.id,
                    is_active=True,
                )
            )

        # ── 4. Basic Admin User ────────────────────────────────────────────
        res_user = await session.execute(
            select(User).where(User.email == settings.admin_email)
        )
        if not res_user.scalar_one_or_none():
            hashed_password = password_hash.hash(settings.admin_password)
            session.add(
                User(
                    tenant_id=tenant.id,
                    email=settings.admin_email,
                    hashed_password=hashed_password,
                    role=UserRole.admin.value,
                    is_active=True,
                )
            )

        # ── 5. Pro Demo Tenant ─────────────────────────────────────────────
        res_pro_tenant = await session.execute(
            select(Tenant).where(Tenant.slug == "pro-demo")
        )
        pro_tenant = res_pro_tenant.scalar_one_or_none()
        if not pro_tenant:
            pro_tenant = Tenant(name="Pro Demo Company", slug="pro-demo")
            session.add(pro_tenant)
            await session.flush()

        res_pro_sub = await session.execute(
            select(TenantSubscription).where(TenantSubscription.tenant_id == pro_tenant.id)
        )
        if not res_pro_sub.scalar_one_or_none():
            session.add(
                TenantSubscription(
                    tenant_id=pro_tenant.id,
                    tier_id=pro_tier.id,
                    is_active=True,
                )
            )

        # ── 6. Pro Admin User ──────────────────────────────────────────────
        pro_admin_email = getattr(settings, "pro_admin_email", "pro_admin@example.com")
        pro_admin_password = getattr(settings, "pro_admin_password", "ProAdmin@123!")

        res_pro_user = await session.execute(
            select(User).where(User.email == pro_admin_email)
        )
        if not res_pro_user.scalar_one_or_none():
            pro_hashed_password = password_hash.hash(pro_admin_password)
            session.add(
                User(
                    tenant_id=pro_tenant.id,
                    email=pro_admin_email,
                    hashed_password=pro_hashed_password,
                    role=UserRole.admin.value,
                    is_active=True,
                )
            )

        # ── 7. Default Manufacturing Materials ─────────────────────────────
        DEFAULT_MATERIALS = [
            ("Aluminum 6061", 2.70),
            ("Mild Steel", 7.85),
            ("Stainless Steel 304", 8.00),
            ("Stainless Steel 316", 8.00),
            ("Brass C360", 8.50),
            ("Copper", 8.96),
            ("Titanium Grade 5", 4.43),
            ("Cast Iron", 7.20),
            ("Delrin (POM)", 1.41),
        ]
        from app.models.material import Material
        for name, density in DEFAULT_MATERIALS:
            res_mat = await session.execute(
                select(Material).where(Material.name == name)
            )
            if not res_mat.scalar_one_or_none():
                session.add(Material(name=name, density_g_cm3=density))

        await session.commit()
        print("✅ Seed process completed successfully.")
        print(f"   Basic Admin email: {settings.admin_email}")
        print(f"   Basic Tenant:      {tenant.name} (slug: {tenant.slug})")
        print(f"   Basic Tier:        Basic")
        print(f"   Pro Admin email:   {pro_admin_email}")
        print(f"   Pro Tenant:        {pro_tenant.name} (slug: {pro_tenant.slug})")
        print(f"   Pro Tier:          Pro")


if __name__ == "__main__":
    asyncio.run(seed())
