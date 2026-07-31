# Industrial Precision Manufacturing Costing Engine & 3D CAD Analytics

![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=flat-square&logo=nextdotjs)
![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20%2F%20R3F-black?style=flat-square&logo=three.js)
![CadQuery](https://img.shields.io/badge/CAD%20Kernel-CadQuery%20%2F%20OpenCASCADE-blue?style=flat-square)
![PostgreSQL 16](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Deployment-Docker%20Compose-2496ED?style=flat-square&logo=docker)

A production-grade, multi-tenant SaaS application designed for precision manufacturing workshops, machine shops, and engineering teams. The platform automates 3D CAD geometry analysis, instant manufacturing cost calculations (machining time, material volume, shop floor overheads, batch scaling), interactive 3D/2D drawing previewing, and professional PDF quote generation.

---

## 🌟 Key Features

- **Automated 3D STEP & 2D CAD Drawing Parsing & Part Form Analysis**:
  - Upload `.step`, `.stp`, `.dxf`, `.dwg`, or `.dwf` files to automatically extract geometry features, volume ($\text{mm}^3$), and surface area ($\text{mm}^2$).
  - **Part Form Selector & Domain Metrics**: Interactively toggle between **Bar Stock** (cylindrical parts displaying Diameter, Radius, Height/Length, and Cross-Sectional Area) and **Sheet Metal** (displaying Thickness, Width, Length, and Sheet Area) instead of generic bounding boxes.
  - **Machining Allowance Integration**: Basic and Pro tier users can configure Radius and Height raw stock allowances in Company Settings, which automatically factor into cylindrical **Part Volume** calculations ($V_{\text{raw}} = \pi \times (R + \Delta R)^2 \times (H + \Delta H)$).
  - Automatic background STEP-to-GLB mesh conversion and 2D vector schematic parsing for instant on-screen visualization.

- **Interactive 3D & 2D CAD Estimator Workspace**:
  - Drag-and-drop CAD upload workspace with live rendering of 3D GLB models (`@react-three/fiber`) or 2D vector drawings (HTML5 Canvas).
  - Instant auto-syncing of extracted CAD geometry features into primary direct material and manufacturing cost calculations.

- **Dynamic Manufacturing Cost Engine**:
  - **Direct Material Cost**: Stock volume calculation with density matrices (Aluminum 6061, Stainless Steel 316, Titanium, Tool Steel, Plastics) and scrap allowance.
  - **Machining Operations & Time**: Rate-based estimation for 3-Axis Milling, 5-Axis CNC, Turning, Wire EDM, and Surface Grinding.
  - **Factory Overheads Allocation**: Shop floor labor rates, machine hourly depreciation, energy consumption, quality control (QC), and secondary finishing (Anodizing, Powder Coating).
  - **Commercials & Batch Scaling**: Volume discount curves, setup fee amortizations, and profit margin multipliers.

- **Multi-Step Costing Wizard & Sticky Footer**:
  - Guided step-by-step cost breakdown workflow (Direct Cost $\rightarrow$ Overheads $\rightarrow$ Commercials & Summary).
  - Real-time responsive calculation bar reflecting instant total price changes.

- **Multi-Tenant RBAC & Subscription Gating**:
  - Role-based access control with subscription tiers (`BASIC`, `PRO`, `ENTERPRISE`).
  - Restricted feature access guarded by `<FeatureGate />` components (e.g. custom factory overhead presets locked behind PRO/ENTERPRISE).

- **Professional PDF Quote Export & Archive**:
  - Generate customized PDF quotes complete with company branding, itemized cost breakdowns, and delivery terms.
  - Filterable quotes archive with historical cost searching and status tracking.

---

## 🏗️ Tech Stack & Architecture

### Backend (`/backend`)
- **Framework**: FastAPI (Python 3.11) with Uvicorn async server.
- **CAD Kernel**: CadQuery + OpenCASCADE (packaged via `condaforge/miniforge3` Docker base image).
- **Database**: PostgreSQL 16 accessed via Async SQLAlchemy 2.0 ORM & Alembic migrations.
- **Security**: JWT session tokens, Bcrypt password hashing, Pydantic v2 input validation schemas, path traversal sanitization, HttpOnly cookies.
- **Testing**: Pytest & Async HTTPX client test suite.

### Frontend (`/frontend`)
- **Framework**: Next.js 15 (App Router, React 18 in TypeScript).
- **State Management**: Zustand (`costingStore.ts`) for zero-latency reactive state across forms, wizard steps, and calculation footers.
- **3D Graphics**: Three.js integrated with `@react-three/fiber` & `@react-three/drei`.
- **Forms & Validation**: `react-hook-form` with `@hookform/resolvers/zod`.
- **Styling**: Tailwind CSS with custom industrial dark theme (`slate-950`, `emerald-500`, `cyan-400`), Framer Motion micro-animations, and glassmorphic UI panels.
- **Testing**: Playwright End-to-End test suite (`estimator-calc.spec.ts`, `rbac.spec.ts`, `rbac-upsell.spec.ts`).

---

## 🚀 Quick Start with Docker

The fastest way to spin up the entire application stack (PostgreSQL, FastAPI Backend, Next.js Frontend) is using Docker Compose:

### 1. Clone the repository & setup environment
```bash
cp .env.example .env
```

### 2. Launch all services
You can run the batch script in the root directory (builds frontend via `npm run build && npm run start` and runs backend):
```cmd
run_app.bat
```
Or use Docker Compose directly:
```bash
docker-compose up --build
```

### 3. Access the Application
- **Frontend App**: `http://localhost:3000`
- **FastAPI OpenAPI Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

---

## 💻 Local Development Setup

If you prefer to run services manually for local development:

### Prerequisites
- Python 3.11+
- Node.js 18+ & `npm`
- PostgreSQL 16 running locally or via Docker

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (Note: CadQuery requires OpenCASCADE binaries; Docker image recommended for CadQuery)
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed initial data (Basic & Pro Admin users, Tenants, Subscriptions)
python seed.py

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend

# Install node dependencies
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌱 Database Seeding & Provisioned Test Accounts

Initial application data is bootstrapped using `backend/seed.py`. The script is **idempotent**, meaning it can be safely executed on both fresh and existing databases to provision missing subscription tiers, tenants, and admin accounts without creating duplicate records or resetting existing data.

### How to Run Seeding

- **Via Docker Compose**:
  ```bash
  docker-compose exec backend python seed.py
  ```

- **Via Local Python Environment**:
  ```bash
  cd backend
  python seed.py
  ```

### Provisioned Demo Accounts

| Account Role | Email Address | Password | Tenant / Organization | Tier | Accessible Features |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Basic Admin** | `admin@example.com` | `Admin@123!` | Demo Company (`demo`) | **Basic** | Direct Cost Calculation (Step 1). Overhead & Commercial steps locked with upsell triggers. |
| **Pro Admin** | `pro_admin@example.com` | `ProAdmin@123!` | Pro Demo Company (`pro-demo`) | **Pro** | Full Access: Direct Cost, Factory Overheads, Taxes, Profit Margins, & Quote PDF Export. |

---

## 🧪 Running Tests

### Backend Unit & Service Tests (Pytest)
```bash
cd backend
pytest -v

# Or via Docker:
docker-compose exec backend pytest -v
```

### Frontend End-to-End Tests (Playwright)
```bash
cd frontend

# Run all Playwright specs
npx playwright test

# Run a specific test spec in headed debug mode
npx playwright test e2e/estimator-calc.spec.ts --headed

# Or via Docker:
docker-compose exec frontend npx playwright test
```

---

## 📁 Repository Structure Overview

```
Costing_calculator/
├── .env.example                    # Environment variables template
├── docker-compose.yml              # Container orchestration for DB, Backend, Frontend
├── AGENTS.md                       # AI Agent instructions, project map & security mandates
├── precision_engineering_interface_DESIGN.md # UI/UX design specifications
│
├── backend/                        # FastAPI Backend Application
│   ├── Dockerfile                  # Miniforge3 container with CadQuery / OpenCASCADE
│   ├── alembic/                    # Database migrations
│   ├── app/
│   │   ├── api/v1/                 # REST endpoints (auth, cad, costing)
│   │   ├── models/                 # SQLAlchemy ORM models (user, tenant, subscription, cost_estimate)
│   │   ├── schemas/                # Pydantic validation schemas
│   │   └── services/               # CAD parsing & manufacturing cost calculation engines
│   └── tests/                      # Pytest unit & service test suites
│
├── frontend/                       # Next.js 15 App Router Frontend
│   ├── Dockerfile                  # Standalone production container build
│   ├── app/                        # App Router pages (login, dashboard, history, settings, upgrade)
│   ├── components/                 # UI primitives, CAD 3D/2D viewers, forms, wizard steps
│   ├── lib/                        # Axios API client, auth helpers, currency formatters
│   ├── store/                      # Zustand costing state store
│   └── e2e/                        # Playwright E2E test specs
└── docs/
    └── api_contract.md             # REST API Contract specifications
```

---

## 🔒 Security & Hardening Highlights

- **JWT Session Security**: Auth tokens are stored strictly in `HttpOnly`, `SameSite=Lax/Strict` cookies via Next.js `/api/set-cookie` routes, neutralizing XSS token theft.
- **SQL Injection Prevention**: All database queries use SQLAlchemy parameter binding.
- **File Upload Safeguards**: CAD upload endpoints enforce strict extension and MIME-type validation, size limits (`MAX_UPLOAD_SIZE_MB`), and filename sanitization to prevent Path Traversal attacks.
- **Tenant Data Isolation**: Database queries incorporate multi-tenant organization filtering (`tenant_id`).

---

## 📄 License & Maintenance

This codebase is maintained with strict AI Agent guidance. For instructions on codebase navigation, security contracts, and maintaining documentation, refer to [AGENTS.md](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/AGENTS.md).
