from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import AsyncGenerator

from app.database import AsyncSessionLocal
from app.dependencies import get_db, get_current_user
from app.schemas.auth import LoginRequest, TokenResponse, MeResponse, UserOut, UserFeatures
from app.models.user import User
from app.models.tenant import Tenant
from app.models.subscription import TenantSubscription, PlanFeature, SubscriptionTier
from app.services.auth_service import verify_password, create_access_token

router = APIRouter()


async def get_public_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Public (unauthenticated) DB session — does NOT set RLS tenant context.
    Use ONLY for endpoints that don't require tenant isolation (login).
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_public_db)):
    """
    Authenticate user and return JWT.
    Uses a public DB session (no RLS context) since no tenant_id is known yet.
    Queries by email with no tenant filter — email is globally unique.
    """
    result = await db.execute(
        select(User, Tenant)
        .join(Tenant, Tenant.id == User.tenant_id)
        .where(User.email == req.email, User.is_active == True)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user, tenant = row
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Fetch the tenant's current subscription tier name
    tier_result = await db.execute(
        select(SubscriptionTier.name)
        .join(TenantSubscription, TenantSubscription.tier_id == SubscriptionTier.id)
        .where(
            TenantSubscription.tenant_id == tenant.id,
            TenantSubscription.is_active == True,
        )
    )
    tier_name = tier_result.scalar() or "Basic"

    token = create_access_token({
        "sub": str(user.id),
        "tenant_id": str(tenant.id),
        "email": user.email,
        "role": str(user.role.value if hasattr(user.role, "value") else user.role),
        "tier": str(tier_name.value if hasattr(tier_name, "value") else tier_name),
    })

    return TokenResponse(
        access_token=token,
        user=UserOut(
            id=str(user.id),
            email=user.email,
            role=str(user.role.value if hasattr(user.role, "value") else user.role),
            tenant_id=str(tenant.id),
            tenant_name=tenant.name,
        ),
    )


@router.get("/me", response_model=MeResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Return current user profile + resolved Plan_Features for the frontend FeatureGate."""
    result = await db.execute(
        select(Tenant.name, PlanFeature)
        .join(TenantSubscription, TenantSubscription.tenant_id == Tenant.id)
        .join(PlanFeature, PlanFeature.tier_id == TenantSubscription.tier_id)
        .where(
            Tenant.id == current_user["tenant_id"],
            TenantSubscription.is_active == True,
        )
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Tenant subscription not found")

    tenant_name, features = row

    return MeResponse(
        id=current_user["user_id"],
        email=current_user["email"],
        role=current_user["role"],
        tenant_id=current_user["tenant_id"],
        tenant_name=tenant_name,
        tier=current_user["tier"],
        features=UserFeatures(
            can_access_direct_cost=features.can_access_direct_cost,
            can_access_overhead_cost=features.can_access_overhead_cost,
            can_access_tax=features.can_access_tax,
            can_access_profit_margin=features.can_access_profit_margin,
        ),
    )
