from pathlib import Path
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from app.dependencies import get_db, get_current_user
from app.models.cost_estimate import CostEstimate
from app.models.machine_profile import ProcessRoutingStep
from app.models.subscription import PlanFeature, TenantSubscription
from app.schemas.costing import CostPayload, CostResult, EstimatesResponse, EstimateListItem
from app.services.cost_engine import calculate_cost

from app.services.quote_service import get_next_quote_ref

from app.config import get_settings

router = APIRouter()
settings = get_settings()

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
    
    # Save/persist result to DB
    estimate = None
    if payload.estimate_id:
        try:
            est_uuid = UUID(str(payload.estimate_id))
            stmt = select(CostEstimate).where(
                CostEstimate.id == est_uuid,
                CostEstimate.tenant_id == current_user["tenant_id"]
            )
            est_res = await db.execute(stmt)
            estimate = est_res.scalar_one_or_none()
        except (ValueError, TypeError):
            estimate = None

    mesh_path = None
    if payload.mesh_url:
        mesh_id = payload.mesh_url.split("/")[-1].split("?")[0]
        candidate_path = Path(settings.upload_dir) / f"{mesh_id}.glb"
        if candidate_path.exists():
            mesh_path = str(candidate_path)

    quote_name = payload.quote_name or payload.filename or "Custom Machined Part"

    if not estimate:
        quote_number, quote_ref = await get_next_quote_ref(db, current_user["tenant_id"])
        estimate = CostEstimate(
            tenant_id=current_user["tenant_id"],
            user_id=current_user["user_id"],
            quote_number=quote_number,
            quote_ref=quote_ref,
            quote_name=quote_name,
            filename=payload.filename or "Custom Machined Part",
            file_type="step",
            geometry_data=payload.geometry_data,
            mesh_file_path=mesh_path,
            currency=payload.currency or "INR",
        )
        db.add(estimate)
        await db.flush()
    else:
        if not estimate.quote_ref:
            quote_number, quote_ref = await get_next_quote_ref(db, current_user["tenant_id"])
            estimate.quote_number = quote_number
            estimate.quote_ref = quote_ref
        estimate.quote_name = quote_name
        if payload.filename:
            estimate.filename = payload.filename
        if payload.geometry_data:
            estimate.geometry_data = payload.geometry_data
        if mesh_path and not estimate.mesh_file_path:
            estimate.mesh_file_path = mesh_path

    estimate.direct_cost = result_data.breakdown.direct_cost.model_dump(mode="json")
    estimate.overhead_cost = result_data.breakdown.overhead_cost.model_dump(mode="json") if result_data.breakdown.overhead_cost else None
    estimate.commercials = result_data.breakdown.commercials.model_dump(mode="json") if result_data.breakdown.commercials else None
    estimate.grand_total = result_data.totals.grand_total
    estimate.tier_applied = result_data.tier_applied

    if payload.direct_cost.routing_steps:
        await db.execute(delete(ProcessRoutingStep).where(ProcessRoutingStep.estimate_id == estimate.id))
        for step_input in payload.direct_cost.routing_steps:
            db.add(ProcessRoutingStep(
                estimate_id=estimate.id,
                machine_profile_id=step_input.machine_profile_id,
                sequence_order=step_input.sequence_order,
                setup_time_mins=step_input.setup_time_mins,
                cycle_time_mins=step_input.cycle_time_mins,
            ))

    await db.commit()
    await db.refresh(estimate)
    
    result_data.estimate_id = str(estimate.id)
    result_data.quote_ref = estimate.quote_ref
    result_data.quote_name = estimate.quote_name
    return result_data

@router.get("", response_model=EstimatesResponse)
@router.get("/estimates", response_model=EstimatesResponse)
async def list_estimates(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CostEstimate)
        .where(CostEstimate.tenant_id == current_user["tenant_id"])
        .order_by(CostEstimate.created_at.desc())
    )
    items = result.scalars().all()
    
    return EstimatesResponse(
        items=[
            EstimateListItem(
                id=item.id,
                quote_ref=item.quote_ref,
                quote_number=item.quote_number,
                quote_name=item.quote_name,
                filename=item.filename,
                file_type=item.file_type,
                grand_total=item.grand_total,
                currency=item.currency,
                tier_applied=item.tier_applied,
                geometry_data=item.geometry_data,
                direct_cost=item.direct_cost,
                overhead_cost=item.overhead_cost,
                commercials=item.commercials,
                created_at=item.created_at
            )
            for item in items
        ],
        total=len(items)
    )

@router.delete("/estimates/{estimate_id}")
@router.delete("/{estimate_id}")
async def delete_estimate(
    estimate_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(CostEstimate).where(
        CostEstimate.id == estimate_id,
        CostEstimate.tenant_id == current_user["tenant_id"]
    )
    result = await db.execute(stmt)
    estimate = result.scalar_one_or_none()
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")

    if estimate.mesh_file_path:
        try:
            p = Path(estimate.mesh_file_path)
            if p.exists():
                p.unlink(missing_ok=True)
        except Exception:
            pass

    await db.delete(estimate)
    await db.commit()
    return {"success": True, "message": "Estimate deleted successfully", "id": str(estimate_id)}

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
