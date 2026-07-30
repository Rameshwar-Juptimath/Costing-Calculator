"""
Manufacturing Costing Engine — FastAPI Application
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, cad, costing
from app.config import get_settings

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run Alembic migrations on startup to keep DB schema in sync."""
    import subprocess
    import sys

    try:
        subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            check=True,
            capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        # Log but don't crash — migrations may already be applied
        print(f"[WARNING] Alembic migration warning: {e.stderr.decode()}")
    yield


app = FastAPI(
    title="Manufacturing Costing Engine",
    version="1.0.0",
    description="Multi-tenant SaaS for physics-based manufacturing cost estimation.",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Parse comma-separated origins from config.
# Note: allow_credentials=True requires explicit origins (not ["*"]).
allowed_origins = [o.strip() for o in settings.allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(cad.router, prefix="/api/v1/cad", tags=["cad"])
app.include_router(costing.router, prefix="/api/v1/cost", tags=["costing"])


@app.get("/health", tags=["system"])
async def health():
    """Health check endpoint for Docker healthcheck and load balancers."""
    return {"status": "ok", "service": "costing-engine-backend"}
