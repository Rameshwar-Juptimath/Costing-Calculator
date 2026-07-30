# =============================================================================
# Backend Dockerfile
# Base: condaforge/miniforge3 (continuumio/miniconda3 is deprecated)
# CadQuery installed via mamba (10-100x faster than conda for OCCT solve)
# =============================================================================

FROM condaforge/miniforge3:latest

# ── System dependencies for CadQuery headless rendering & C compilation ──────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libgl1 \
    libglx-mesa0 \
    libglu1-mesa \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ── CadQuery via mamba (conda-forge channel) ─────────────────────────────────
# mamba solver is dramatically faster than conda for heavy OCCT dependencies
RUN mamba install -y -c conda-forge cadquery && \
    mamba clean -afy

# ── Python/FastAPI stack via pip ──────────────────────────────────────────────
RUN pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    "sqlalchemy[asyncio]" \
    asyncpg \
    "pyjwt[crypto]" \
    pydantic-settings \
    email-validator \
    ezdxf \
    pandas \
    python-multipart \
    "pwdlib[argon2]" \
    alembic \
    psycopg2-binary \
    httpx

# ── App setup ─────────────────────────────────────────────────────────────────
WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

COPY . .

# ── Entrypoint ────────────────────────────────────────────────────────────────
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
