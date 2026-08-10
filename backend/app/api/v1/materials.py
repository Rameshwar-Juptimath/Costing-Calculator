from uuid import UUID
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, get_current_user
from app.models.material_machinability import MaterialMachinability
from app.schemas.material import (
    MaterialMachinabilityCreate,
    MaterialMachinabilityUpdate,
    MaterialMachinabilityResponse,
    MaterialMachinabilityListResponse,
    CycleTimeCalculationRequest,
    CycleTimeCalculationResponse,
)
from app.services.machining_service import calculate_turning_machining_time

router = APIRouter()

DEFAULT_FALLBACK_MATERIALS = [
    ("Aluminum 6061 - Carbide Tooling", 300.0, 0.25, 2.70),
    ("Mild Steel A36 - Carbide Tooling", 180.0, 0.20, 7.85),
    ("Stainless Steel 316 - Carbide Tooling", 120.0, 0.15, 8.00),
    ("Stainless Steel 304 - Carbide Tooling", 130.0, 0.16, 8.00),
    ("Brass C360 - High Speed Tooling", 350.0, 0.30, 8.50),
    ("Titanium Grade 5 - Carbide Tooling", 50.0, 0.10, 4.43),
    ("Delrin (POM) - High Speed Tooling", 400.0, 0.35, 1.41),
    ("Cast Iron - Carbide Tooling", 150.0, 0.22, 7.20),
]


@router.get("", response_model=MaterialMachinabilityListResponse)
async def list_materials(
    active_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all material machinability profiles belonging to the authenticated tenant."""
    tenant_id = current_user["tenant_id"]
    stmt = select(MaterialMachinability).where(MaterialMachinability.tenant_id == tenant_id)
    if active_only:
        stmt = stmt.where(MaterialMachinability.is_active == True)
    stmt = stmt.order_by(MaterialMachinability.material_name.asc())
    res = await db.execute(stmt)
    materials = res.scalars().all()

    # Auto-seed defaults if tenant has no materials yet
    if not materials:
        new_materials = []
        for name, vc, fr, dens in DEFAULT_FALLBACK_MATERIALS:
            m = MaterialMachinability(
                tenant_id=tenant_id,
                material_name=name,
                cutting_speed_m_min=vc,
                feed_rate_mm_rev=fr,
                density_g_cm3=dens,
                is_active=True,
            )
            db.add(m)
            new_materials.append(m)
        await db.commit()
        for m in new_materials:
            await db.refresh(m)
        materials = new_materials

    return MaterialMachinabilityListResponse(
        items=[MaterialMachinabilityResponse.model_validate(m) for m in materials],
        total=len(materials),
    )


@router.post("", response_model=MaterialMachinabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_material(
    payload: MaterialMachinabilityCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new material machinability profile for the authenticated tenant."""
    material = MaterialMachinability(
        tenant_id=current_user["tenant_id"],
        material_name=payload.material_name.strip(),
        cutting_speed_m_min=payload.cutting_speed_m_min,
        feed_rate_mm_rev=payload.feed_rate_mm_rev,
        density_g_cm3=payload.density_g_cm3,
        is_active=payload.is_active,
    )
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return MaterialMachinabilityResponse.model_validate(material)


@router.get("/{material_id}", response_model=MaterialMachinabilityResponse)
async def get_material(
    material_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a specific material machinability profile by ID."""
    stmt = select(MaterialMachinability).where(
        MaterialMachinability.id == material_id,
        MaterialMachinability.tenant_id == current_user["tenant_id"],
    )
    res = await db.execute(stmt)
    material = res.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material profile not found")
    return MaterialMachinabilityResponse.model_validate(material)


@router.put("/{material_id}", response_model=MaterialMachinabilityResponse)
async def update_material(
    material_id: UUID,
    payload: MaterialMachinabilityUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing material machinability profile."""
    stmt = select(MaterialMachinability).where(
        MaterialMachinability.id == material_id,
        MaterialMachinability.tenant_id == current_user["tenant_id"],
    )
    res = await db.execute(stmt)
    material = res.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material profile not found")

    if payload.material_name is not None:
        material.material_name = payload.material_name.strip()
    if payload.cutting_speed_m_min is not None:
        material.cutting_speed_m_min = payload.cutting_speed_m_min
    if payload.feed_rate_mm_rev is not None:
        material.feed_rate_mm_rev = payload.feed_rate_mm_rev
    if payload.density_g_cm3 is not None:
        material.density_g_cm3 = payload.density_g_cm3
    if payload.is_active is not None:
        material.is_active = payload.is_active

    await db.commit()
    await db.refresh(material)
    return MaterialMachinabilityResponse.model_validate(material)


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a material machinability profile."""
    stmt = select(MaterialMachinability).where(
        MaterialMachinability.id == material_id,
        MaterialMachinability.tenant_id == current_user["tenant_id"],
    )
    res = await db.execute(stmt)
    material = res.scalar_one_or_none()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material profile not found")

    await db.delete(material)
    await db.commit()
    return None


@router.post("/calculate-cycle-time", response_model=CycleTimeCalculationResponse)
async def calculate_cycle_time(
    payload: CycleTimeCalculationRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Calculate dynamic RPM and turning cycle time based on metallurgical constants
    and CAD geometry dimensions.
    """
    result = calculate_turning_machining_time(
        cutting_speed_m_min=payload.cutting_speed_m_min,
        feed_rate_mm_rev=payload.feed_rate_mm_rev,
        part_diameter_mm=payload.part_diameter_mm,
        cut_length_mm=payload.cut_length_mm,
    )
    return CycleTimeCalculationResponse(**result)
