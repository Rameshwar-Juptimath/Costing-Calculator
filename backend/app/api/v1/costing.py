from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.dependencies import get_db, get_current_user
from app.models.cost_estimate import CostEstimate
from app.models.subscription import PlanFeature, TenantSubscription
from app.schemas.costing import CostPayload, CostResult, EstimatesResponse, EstimateListItem
from app.services.cost_engine import calculate_cost

router = APIRouter()

@router.post("/calculate", response_model=CostResult)
async def calculate_cost_endpoint(
    payload: CostPayload,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch features for user's tenant
    result = await db.execute(
        select(PlanFeature)
        .join(TenantSubscription, TenantSubscription.tier_id == PlanFeature.tier_id)
        .where(TenantSubscription.tenant_id == current_user["tenant_id"])
    )
    features = result.scalar_one_or_none()
    if not features:
        raise HTTPException(status_code=403, detail="Plan features not found")
        
    result_data = calculate_cost(payload, features)
    
    # Save result to DB
    stmt = select(CostEstimate).where(CostEstimate.id == payload.estimate_id)
    est_res = await db.execute(stmt)
    estimate = est_res.scalar_one_or_none()
    if estimate:
        estimate.direct_cost = result_data.breakdown.direct_cost.model_dump()
        estimate.overhead_cost = result_data.breakdown.overhead_cost.model_dump() if result_data.breakdown.overhead_cost else None
        estimate.commercials = result_data.breakdown.commercials.model_dump() if result_data.breakdown.commercials else None
        estimate.grand_total = result_data.totals.grand_total
        estimate.tier_applied = result_data.tier_applied
        await db.commit()
        
    return result_data

@router.get("/estimates", response_model=EstimatesResponse)
async def list_estimates(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CostEstimate).order_by(CostEstimate.created_at.desc())
    )
    items = result.scalars().all()
    
    return EstimatesResponse(
        items=[
            EstimateListItem(
                id=item.id,
                filename=item.filename,
                file_type=item.file_type,
                grand_total=item.grand_total,
                currency=item.currency,
                tier_applied=item.tier_applied,
                created_at=item.created_at
            )
            for item in items
        ],
        total=len(items)
    )

@router.get("/materials")
async def list_materials(db: AsyncSession = Depends(get_db)):
    from app.models.material import Material
    try:
        result = await db.execute(select(Material).order_by(Material.name.asc()))
        materials = result.scalars().all()
        if materials:
            return [{"id": str(m.id), "name": m.name, "density_g_cm3": m.density_g_cm3} for m in materials]
    except Exception:
        pass

    return [
        {"name": "Aluminum 6061", "density_g_cm3": 2.70},
        {"name": "Mild Steel", "density_g_cm3": 7.85},
        {"name": "Stainless Steel 304", "density_g_cm3": 8.00},
        {"name": "Stainless Steel 316", "density_g_cm3": 8.00},
        {"name": "Brass C360", "density_g_cm3": 8.50},
        {"name": "Copper", "density_g_cm3": 8.96},
        {"name": "Titanium Grade 5", "density_g_cm3": 4.43},
        {"name": "Cast Iron", "density_g_cm3": 7.20},
        {"name": "Delrin (POM)", "density_g_cm3": 1.41},
    ]
