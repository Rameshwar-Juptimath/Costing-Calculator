from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.dependencies import get_db, get_current_user
from app.models.machine_profile import MachineProfile
from app.schemas.machine import (
    MachineProfileCreate,
    MachineProfileUpdate,
    MachineProfileResponse,
    MachineProfileListResponse,
)

router = APIRouter()

@router.get("", response_model=MachineProfileListResponse)
async def list_machines(
    active_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all machine profiles belonging to the authenticated tenant."""
    stmt = select(MachineProfile).where(MachineProfile.tenant_id == current_user["tenant_id"])
    if active_only:
        stmt = stmt.where(MachineProfile.is_active == True)
    stmt = stmt.order_by(MachineProfile.created_at.asc())
    res = await db.execute(stmt)
    machines = res.scalars().all()

    return MachineProfileListResponse(
        items=[MachineProfileResponse.model_validate(m) for m in machines],
        total=len(machines),
    )

@router.post("", response_model=MachineProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_machine(
    payload: MachineProfileCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new machine profile for the authenticated tenant."""
    machine = MachineProfile(
        tenant_id=current_user["tenant_id"],
        machine_name=payload.machine_name.strip(),
        hourly_rate_inr=payload.hourly_rate_inr,
        operator_rate_inr=payload.operator_rate_inr,
        is_active=payload.is_active,
    )
    db.add(machine)
    await db.commit()
    await db.refresh(machine)
    return MachineProfileResponse.model_validate(machine)

@router.get("/{machine_id}", response_model=MachineProfileResponse)
async def get_machine(
    machine_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a specific machine profile by ID."""
    stmt = select(MachineProfile).where(
        MachineProfile.id == machine_id,
        MachineProfile.tenant_id == current_user["tenant_id"],
    )
    res = await db.execute(stmt)
    machine = res.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine profile not found")
    return MachineProfileResponse.model_validate(machine)

@router.put("/{machine_id}", response_model=MachineProfileResponse)
async def update_machine(
    machine_id: UUID,
    payload: MachineProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing machine profile."""
    stmt = select(MachineProfile).where(
        MachineProfile.id == machine_id,
        MachineProfile.tenant_id == current_user["tenant_id"],
    )
    res = await db.execute(stmt)
    machine = res.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine profile not found")

    if payload.machine_name is not None:
        machine.machine_name = payload.machine_name.strip()
    if payload.hourly_rate_inr is not None:
        machine.hourly_rate_inr = payload.hourly_rate_inr
    if payload.operator_rate_inr is not None:
        machine.operator_rate_inr = payload.operator_rate_inr
    if payload.is_active is not None:
        machine.is_active = payload.is_active

    await db.commit()
    await db.refresh(machine)
    return MachineProfileResponse.model_validate(machine)

@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_machine(
    machine_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete or delete a machine profile."""
    stmt = select(MachineProfile).where(
        MachineProfile.id == machine_id,
        MachineProfile.tenant_id == current_user["tenant_id"],
    )
    res = await db.execute(stmt)
    machine = res.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Machine profile not found")

    await db.delete(machine)
    await db.commit()
    return None
