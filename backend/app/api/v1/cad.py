import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.dependencies import get_db, require_feature
from app.config import get_settings
from app.models.cost_estimate import CostEstimate
from app.schemas.cad import UploadResponse
from app.services.cad_service import process_step_file, process_dxf_file

router = APIRouter()
settings = get_settings()

MAX_CHUNK = 1024 * 1024  # 1 MB


@router.post("/upload", response_model=UploadResponse)
async def upload_cad(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_feature("can_access_direct_cost")),
    db: AsyncSession = Depends(get_db),
):
    """
    Accept a STEP/STP/DXF file, extract geometry, save a .glb mesh, and
    create a CostEstimate record. Returns geometry data + mesh URL.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in {"step", "stp", "dxf"}:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only .step, .stp, and .dxf are accepted.",
        )

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Use a UUID-prefixed filename to avoid collisions
    safe_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = upload_dir / safe_name

    # Stream file to disk while enforcing 100 MB limit
    size = 0
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    with open(file_path, "wb") as out_file:
        while True:
            chunk = await file.read(MAX_CHUNK)
            if not chunk:
                break
            size += len(chunk)
            if size > max_bytes:
                # Clean up partial file before raising
                file_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"File size exceeds {settings.max_upload_size_mb} MB limit.",
                )
            out_file.write(chunk)

    is_step = ext in {"step", "stp"}
    try:
        if is_step:
            result = await process_step_file(str(file_path), str(upload_dir))
        else:
            result = await process_dxf_file(str(file_path))
    except Exception as exc:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"CAD processing failed: {exc}") from exc

    estimate = CostEstimate(
        tenant_id=current_user["tenant_id"],
        user_id=current_user["user_id"],
        filename=file.filename,
        file_type="step" if is_step else "dxf",
        geometry_data=result["geometry"],
        mesh_file_path=result.get("glb_path"),
        currency="INR",
    )
    db.add(estimate)
    await db.flush()  # flush to get the generated UUID before commit

    mesh_url = (
        f"/api/v1/cad/mesh/{estimate.id}" if result.get("glb_path") else None
    )

    return UploadResponse(
        estimate_id=str(estimate.id),
        filename=file.filename,
        file_type="step" if is_step else "dxf",
        geometry=result["geometry"],
        mesh_url=mesh_url,
    )


@router.get("/mesh/{estimate_id}")
async def get_mesh(
    estimate_id: str,
    current_user: dict = Depends(require_feature("can_access_direct_cost")),
    db: AsyncSession = Depends(get_db),
):
    """Return the binary .glb file for 3D rendering in the frontend."""
    result = await db.execute(
        select(CostEstimate).where(CostEstimate.id == estimate_id)
    )
    estimate = result.scalar_one_or_none()

    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found.")
    if not estimate.mesh_file_path or not Path(estimate.mesh_file_path).exists():
        raise HTTPException(status_code=404, detail="Mesh file not found.")

    return FileResponse(
        estimate.mesh_file_path,
        media_type="model/gltf-binary",
        filename=f"{estimate_id}.glb",
    )
