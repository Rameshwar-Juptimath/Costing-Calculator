from typing import AsyncGenerator
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from app.config import get_settings
from app.database import AsyncSessionLocal
from app.models.subscription import TenantSubscription, PlanFeature
from app.services.auth_service import decode_token

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_token(token)
        return {
            "user_id": payload.get("sub"),
            "tenant_id": payload.get("tenant_id"),
            "email": payload.get("email"),
            "role": payload.get("role"),
            "tier": payload.get("tier"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def get_db(current_user: dict = Depends(get_current_user)) -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        await session.execute(
            text("SELECT set_config('app.tenant_id', :tid, true)"),
            {"tid": str(current_user["tenant_id"])}
        )
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

def require_feature(feature_name: str):
    async def _dep(current_user=Depends(get_current_user), db=Depends(get_db)):
        result = await db.execute(
            select(PlanFeature)
            .join(TenantSubscription, TenantSubscription.tier_id == PlanFeature.tier_id)
            .where(TenantSubscription.tenant_id == current_user["tenant_id"])
        )
        features = result.scalar_one_or_none()
        if not features or not getattr(features, feature_name, False):
            raise HTTPException(status_code=403, detail=f"Feature '{feature_name}' not available on your plan. Upgrade to Pro.")
        return current_user
    return _dep
