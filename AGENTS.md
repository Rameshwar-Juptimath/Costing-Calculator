# AGENTS.md — AI Agent Guidance & Master Project Index

> **IMPORTANT FOR ALL CODING AGENTS**: 
> Read this file **first** before searching the filesystem or reading multiple source files. This document contains the complete project map, file routing, architectural contracts, design skills, security mandates, test protocols, and self-maintenance instructions.
> **DO NOT waste tokens browsing directories when modifying code — consult the Project Map below!**

---

## 1. Quick Task-to-File Lookup Index

When tasked with modifying or adding a feature, immediately jump to the relevant file(s):

| User Request / Task | Target File(s) to Modify |
| :--- | :--- |
| **CAD Analysis & Geometry Parsing** | [backend/app/services/cad_service.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/services/cad_service.py), [backend/app/api/v1/cad.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/api/v1/cad.py) |
| **Manufacturing Cost Calculation Logic** | [backend/app/services/cost_engine.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/services/cost_engine.py), [backend/app/api/v1/costing.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/api/v1/costing.py) |
| **Frontend State & Calculation Engine** | [frontend/store/costingStore.ts](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/store/costingStore.ts) |
| **3D & 2D CAD Renderers** | [frontend/components/viewer/CADUploadViewer.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/viewer/CADUploadViewer.tsx), [frontend/components/viewer/DXF2DViewer.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/viewer/DXF2DViewer.tsx), [frontend/components/cad-viewer.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/cad-viewer.tsx) |
| **Estimator Cost Input & Overheads Forms** | [frontend/components/cost-input-form.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/cost-input-form.tsx), [frontend/components/company-overheads-form.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/company-overheads-form.tsx) |
| **Multi-Step Costing Wizard** | [frontend/components/wizard/WizardShell.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/wizard/WizardShell.tsx), `Step1DirectCost.tsx`, `Step2Overhead.tsx`, `Step3Commercials.tsx` |
| **Results Display & PDF Export** | [frontend/components/ResultsPanel.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/ResultsPanel.tsx), [frontend/components/pdf-export-modal.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/pdf-export-modal.tsx) |
| **Authentication & RBAC Gating** | [backend/app/api/v1/auth.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/api/v1/auth.py), [frontend/components/FeatureGate.tsx](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/components/FeatureGate.tsx), [frontend/middleware.ts](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/middleware.ts) |
| **Database Models & Alembic Migrations** | `backend/app/models/` ([cost_estimate.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/models/cost_estimate.py), [user.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/models/user.py), [tenant.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/models/tenant.py), [subscription.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/app/models/subscription.py)), `backend/alembic/` |
| **Backend Unit & Service Tests** | [backend/tests/test_cost_engine.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/tests/test_cost_engine.py), [backend/tests/test_cad_service.py](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/backend/tests/test_cad_service.py) |
| **Frontend E2E Specs (Playwright)** | [frontend/e2e/estimator-calc.spec.ts](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/e2e/estimator-calc.spec.ts), [frontend/e2e/rbac.spec.ts](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/e2e/rbac.spec.ts), [frontend/e2e/rbac-upsell.spec.ts](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/e2e/rbac-upsell.spec.ts) |
| **Global Styling & UI Design System** | [frontend/app/globals.css](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/app/globals.css), [frontend/tailwind.config.ts](file:///d:/Work/My_Work/freelance_projects/Costing_calculator/frontend/tailwind.config.ts), `frontend/components/ui/` |

---

## 2. Complete Project Map & File Structure

```
Costing_calculator/
├── .env                            # Environment variables (DB URLs, JWT Secrets, Admin credentials)
├── .env.example                    # Template for environment configuration
├── README.md                       # Master project overview, features, quickstart & setup documentation
├── AGENTS.md                       # AI Agent guidance, project map, security mandates & self-maintenance rules
├── docker-compose.yml              # Container orchestration (PostgreSQL 16, FastAPI Backend, Next.js Frontend)
├── create_frontend.py              # Automated frontend component scaffolding utility
├── precision_engineering_interface_DESIGN.md # Detailed UI/UX spec for industrial costing UI
│
├── backend/                        # FastAPI Backend Application
│   ├── Dockerfile                  # Miniforge3 base image with CadQuery / OpenCASCADE & Python 3.11
│   ├── alembic.ini                 # Database migration configuration
│   ├── seed.py                     # Initial database seeding script (Users, Tenants, Subscriptions)
│   ├── alembic/                    # DB Migration scripts
│   │   ├── env.py                  # Alembic environment runner
│   │   └── versions/               # Migration revision history
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application entrypoint, CORS setup, router registrations
│   │   ├── config.py               # Pydantic Settings (DB URLs, JWT keys, upload limits)
│   │   ├── database.py             # Async SQLAlchemy engine & session maker setup
│   │   ├── dependencies.py         # Auth & DB dependency injectors (get_db, get_current_user)
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py         # Login, Registration, Token management endpoints
│   │   │       ├── cad.py          # STEP/IGES CAD file upload, parsing, STL export endpoints
│   │   │       └── costing.py      # Manufacturing cost calculation & historical quote saving
│   │   ├── models/
│   │   │   ├── base.py             # Declarative Base class
│   │   │   ├── user.py             # User ORM model
│   │   │   ├── tenant.py           # Multi-tenant Organization ORM model
│   │   │   ├── subscription.py     # Subscription tiers (BASIC, PRO, ENTERPRISE) ORM model
│   │   │   └── cost_estimate.py    # Cost Estimate & Calculation History ORM model
│   │   ├── schemas/
│   │   │   ├── auth.py             # Pydantic auth schemas (Token, UserCreate, UserResponse)
│   │   │   ├── cad.py              # Pydantic CAD analysis schemas (CADUploadResponse, CADMetadata)
│   │   │   └── costing.py          # Pydantic costing schemas (CostCalculationRequest, Breakdown)
│   │   └── services/
│   │       ├── auth_service.py     # Password hashing (bcrypt) & JWT token minting/verification
│   │       ├── cad_service.py      # CadQuery integration: volume, surface area, bounding box, STL mesh export
│   │       └── cost_engine.py      # Core Cost Calculation Engine (Direct material, machining time, overheads, margin)
│   └── tests/
│       ├── conftest.py             # Pytest fixtures, test database setup, async HTTP client
│       ├── test_cost_engine.py     # Unit tests for cost calculation formulas & edge cases
│       ├── test_cad_service.py     # Unit tests for CAD file parsing
│       └── generate_test_cube.py   # Utility script to generate test STEP geometry files
│
├── frontend/                       # Next.js 15 App Router Frontend
│   ├── Dockerfile                  # Multi-stage production build for standalone Next.js
│   ├── package.json                # React 18, Three.js, Zustand, Tailwind, Playwright
│   ├── tailwind.config.ts          # Custom industrial color palette, glassmorphism utilities, dark mode
│   ├── tsconfig.json               # TypeScript configuration (@/* alias mappings)
│   ├── middleware.ts               # Next.js edge auth middleware (JWT cookie verification & route protection)
│   ├── app/
│   │   ├── globals.css             # Tailwind base layers, custom scrollbars, animations
│   │   ├── layout.tsx              # Root HTML layout wrapper
│   │   ├── page.tsx                # Landing / Redirect entry page
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Dedicated Auth layout
│   │   │   └── login/page.tsx      # Login & authentication page
│   │   ├── api/
│   │   │   ├── logout/route.ts     # Cookie-clearing route handler
│   │   │   └── set-cookie/route.ts # HttpOnly JWT cookie setter handler
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Dashboard Shell with Navigation Sidebar & Header
│   │   │   ├── page.tsx            # Main Estimator Workspace Dashboard
│   │   │   ├── history/page.tsx    # Past Quotes Archive page with search/filter
│   │   │   ├── settings/page.tsx   # Company Overheads & Settings (Basic tier upsell guarded)
│   │   │   ├── upgrade/page.tsx    # Subscription Upgrade & Checkout page
│   │   │   └── upgrade/success/page.tsx # Checkout success confirmation page
│   │   └── estimate/
│   │       └── page.tsx            # Direct estimator route
│   ├── components/
│   │   ├── FeatureGate.tsx         # Tier-based RBAC component guard (BASIC vs PRO vs ENTERPRISE)
│   │   ├── ResultsPanel.tsx        # Financial breakdown card with dynamic charts & currency formatters
│   │   ├── basic-tier-upsell-card.tsx # Upsell modal/card for restricted features
│   │   ├── cad-viewer.tsx          # Integrated 3D viewer wrapper with interactive control overlays
│   │   ├── company-overheads-form.tsx # Comprehensive factory overhead input matrix
│   │   ├── cost-input-form.tsx     # Direct material, machining operations, and batch volume inputs
│   │   ├── pdf-export-modal.tsx    # Professional PDF quote generation modal
│   │   ├── sticky-cost-footer.tsx  # Dynamic bottom bar displaying live cost updates
│   │   ├── ui/                     # Reusable UI primitives
│   │   │   ├── Badge.tsx           # Status & tier badges
│   │   │   ├── Button.tsx          # Micro-animated button component
│   │   │   ├── Card.tsx            # Glassmorphism container card
│   │   │   ├── CurrencyInput.tsx   # Auto-formatting financial input component
│   │   │   ├── Input.tsx           # Accessible text/number input primitive
│   │   │   └── Modal.tsx           # Dynamic dialog overlay component
│   │   ├── viewer/                 # Advanced 3D & 2D CAD graphics components
│   │   │   ├── CADUploadViewer.tsx # File dropzone with automatic STEP upload & 3D render preview
│   │   │   ├── CADViewer.tsx       # Three.js canvas setup wrapper
│   │   │   ├── DXF2DViewer.tsx     # Canvas-based 2D DXF drawing renderer
│   │   │   └── Scene.tsx           # R3F 3D lighting, grid, orbit controls, mesh rendering setup
│   │   └── wizard/                 # Guided Step-by-Step Costing Flow
│   │       ├── WizardShell.tsx     # Step navigation container & progress tracker
│   │       ├── Step1DirectCost.tsx # Step 1: Material & Machine operations
│   │       ├── Step2Overhead.tsx   # Step 2: Shop floor overhead allocation
│   │       └── Step3Commercials.tsx# Step 3: Margin, markup, batch quantity, & total quote preview
│   ├── lib/
│   │   ├── api.ts                  # Axios/Fetch client with JWT interceptors
│   │   ├── auth.ts                 # Client-side session and auth state helpers
│   │   ├── currency.ts             # Precision financial formatting utilities (USD, EUR, GBP, INR)
│   │   └── schemas.ts              # Shared client Zod validation schemas
│   ├── store/
│   │   └── costingStore.ts         # Central Zustand state store (Material, Operations, Overheads, Quote)
│   └── e2e/                        # End-to-End Test Suite (Playwright)
│       ├── playwright.config.ts    # Playwright runner configuration
│       ├── estimator-calc.spec.ts  # End-to-end calculation accuracy tests
│       ├── rbac.spec.ts            # Role-based access control tests
│       └── rbac-upsell.spec.ts     # Upgrade trigger & feature gate tests
└── docs/
    └── api_contract.md             # REST API Contract specification
```

---

## 3. Core Tech Stack & Architecture Standards

### Backend Architecture
- **Framework**: FastAPI (Python 3.11) asynchronously powered by Uvicorn.
- **CAD Kernel**: CadQuery + OpenCASCADE (via `condaforge/miniforge3` Docker container) for high-precision 3D geometry analysis (bounding box, volume, surface area, face count, feature recognition, STEP-to-STL mesh conversion).
- **Database**: PostgreSQL 16 accessed via Async SQLAlchemy ORM & Alembic migrations.
- **Authentication**: JWT (JSON Web Tokens) encrypted with HS256 algorithm. Bcrypt password hashing.

### Frontend Architecture
- **Framework**: Next.js 15 (App Router with Server/Client components) & React 18 in TypeScript.
- **3D Graphics Engine**: Three.js integrated via `@react-three/fiber` (R3F) and `@react-three/drei`.
- **State Management**: Zustand (`costingStore.ts`) for real-time reactivity across forms, wizard steps, 3D viewers, and calculation footers.
- **Forms & Validation**: `react-hook-form` paired with `@hookform/resolvers/zod` for zero-latency client validation.
- **Styling**: Tailwind CSS with custom theme extensions (`globals.css`), Framer Motion for liquid micro-animations, glassmorphic UI design.

---

## 4. UI/UX Pro Max & Ponytail Design Guidelines

To guarantee that the application remains visually stunning, lightning-fast, maintainable, and low in technical debt, all coding agents MUST adhere to these design and engineering methodologies:

### UI/UX Pro Max Principles (Visual Excellence & Ergonomics)
*Reference: [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)*

1. **Industrial Precision Aesthetic**:
   - Palette: Deep charcoal dark mode (`bg-slate-950`, `bg-zinc-900`), glowing emerald/cyan primary accents (`emerald-500`, `cyan-400`), crisp muted borders (`border-slate-800`).
   - Glassmorphism: Use subtle backdrop blurs (`backdrop-blur-md bg-slate-900/80 border border-slate-800/60 shadow-xl`) for panels, modals, and sticky bars.
   - Typography: Clean sans-serif hierarchy (Inter/Roboto), tabular numbers for currency and engineering measurements (`font-mono` / `tabular-nums`).

2. **Dynamic Micro-Interactions**:
   - Buttons, inputs, and tab switches MUST feature interactive hover states and Framer Motion transitions (`whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`).
   - Instant Feedback: Immediate state reflection on cost changes, live calculation updates without page refreshes.

3. **Zero Placeholder Policy**:
   - Never render blank states or generic fallback text. Always show skeleton loaders, clear empty state illustrations, or pre-seeded engineering default values.

### Ponytail Principles (Concise Code & Max Functionality)
*Reference: [ponytail](https://github.com/DietrichGebert/ponytail)*

1. **Less Code, Max Functionality**:
   - Write ultra-compact, declarative functions. Avoid boilerplate classes or redundant wrapper layers.
   - Prefer custom hooks (`useCostingStore`) and atomic UI components over deeply nested prop-drilling trees.

2. **High Ergonomics & Zero Dead Code**:
   - Eliminate unused imports, redundant types, and unused helper functions.
   - Reuse existing UI primitives in `frontend/components/ui/` (`Button`, `Card`, `Input`, `CurrencyInput`, `Modal`, `Badge`) before writing new ones.

---

## 5. Security & Cyber-Hardening Mandates ("Hack-Proof Standards")

All modifications MUST strictly maintain the following security practices:

### A. Authentication & Session Security
- **JWT Handling**: Access tokens MUST be transmitted over secure, HttpOnly, SameSite=Lax/Strict cookies via Next.js backend API routes (`/api/set-cookie`). Never expose JWT tokens in `localStorage` or `sessionStorage` where XSS attacks could exfiltrate them.
- **Middleware Guarding**: `frontend/middleware.ts` MUST validate JWT session signatures before rendering protected `/dashboard` routes.
- **Role-Based Access Control (RBAC)**: All sensitive routes and component views MUST be gated by `FeatureGate.tsx` on the frontend and `dependencies.py` (`require_subscription_tier`) on the backend.

### B. Input Validation & Injection Defense
- **Backend Pydantic Schemas**: Every FastAPI endpoint MUST define explicit Pydantic request body and query schemas. Never parse untyped JSON dictionaries.
- **SQL Injection Prevention**: Always use SQLAlchemy ORM parameter binding. Raw string-interpolated SQL (`SELECT * FROM table WHERE id = '` + id + `'`) is **strictly forbidden**.
- **XSS & Content Security**: React handles auto-escaping by default. Do not use `dangerouslySetInnerHTML` unless rendering sanitized SVG/DXF strings with an audited sanitizer.

### C. File Upload Hardening (CAD & STEP Handling)
- **Extension & MIME Validation**: STEP/IGES/STL uploads MUST be validated by both extension (`.step`, `.stp`, `.iges`, `.igs`, `.stl`) and binary magic headers.
- **Size Cap Enforcement**: Reject uploads exceeding `MAX_UPLOAD_SIZE_MB` (default 100MB) immediately at the web server / FastAPI dependency level.
- **CAD Kernel Sandbox Safety**: Executing python code or parsing binary CAD streams must sanitize paths using `os.path.basename` to prevent Path Traversal (`../../etc/passwd`).

### D. CORS & Environment Hygiene
- **Strict CORS Policy**: `ALLOWED_ORIGINS` must restrict cross-origin requests exclusively to trusted frontend domains.
- **No Hardcoded Secrets**: Secrets (JWT secret, DB passwords, API keys) must be loaded strictly from environment variables via `config.py` / `.env`.

---

## 6. Testing Protocols & Execution Instructions

Before declaring any feature complete or committing changes, you MUST run the test suites to ensure zero regressions.

### A. Backend Unit & Integration Tests (Pytest)
Run pytest inside the backend container or local virtual environment:

```bash
# Running all backend tests
cd backend
pytest

# Running specific test files
pytest tests/test_cost_engine.py
pytest tests/test_cad_service.py

# Running pytest inside Docker Compose setup
docker-compose exec backend pytest -v
```

**Key Backend Test Files**:
- `backend/tests/test_cost_engine.py`: Validates calculation formulas (machining hours, material volume cost, scrap rate, overhead multipliers, profit margins).
- `backend/tests/test_cad_service.py`: Validates CAD file parsing, volume extraction, and mesh export functions.

### B. Frontend End-to-End Tests (Playwright)
Run Playwright specs in `frontend/e2e`:

```bash
# Running all E2E specs
cd frontend
npx playwright test

# Running a specific spec in headless mode
npx playwright test e2e/estimator-calc.spec.ts

# Running tests with visual browser UI debugging
npx playwright test e2e/rbac-upsell.spec.ts --headed

# Running Playwright tests inside frontend container
docker-compose exec frontend npx playwright test
```

**Key Frontend E2E Test Files**:
- `frontend/e2e/estimator-calc.spec.ts`: Tests form inputs, live cost calculations, currency formatting, and sticky footer responsiveness.
- `frontend/e2e/rbac.spec.ts`: Tests multi-tier RBAC authentication and protected route redirects.
- `frontend/e2e/rbac-upsell.spec.ts`: Tests tier upgrade modal triggers and feature gating.

---

## 7. Mandatory Protocol for Maintaining `AGENTS.md` and `README.md`

> ⚠️ **CRITICAL INSTRUCTION FOR ALL AI AGENTS**:
> Whenever you modify the application (adding files, deleting files, renaming routes, altering state stores, updating schemas, adding feature endpoints, or changing test setups), you **MUST UPDATE BOTH `AGENTS.md` AND `README.md` IN THE EXACT SAME TASK STEP**.

### Rules for Updating `AGENTS.md`:
1. **File Added**: Add the new file to the **Quick Task-to-File Lookup Index** (Section 1) and the **Complete Project Map** (Section 2).
2. **File Deleted/Renamed**: Update or remove references to the deleted/renamed file across all sections.
3. **New Test Added**: Update Section 6 (**Testing Protocols**) with instructions on how to run the new test file or test command.
4. **Architectural / Security Change**: Document any new security middleware, feature gates, or API contract updates in Section 3 and Section 5.

### Rules for Updating `README.md`:
1. **New Feature / Endpoint Added**: Update Section 1 (**Key Features**) and Section 8 (**Repository Overview**) of `README.md` to reflect new user-facing functionality.
2. **Tech Stack / Dependency Change**: Update Section 3 (**Tech Stack & Architecture**) with newly added libraries or services.
3. **Setup / Environment Variable Added**: Update Section 4 (**Quick Start**) and Environment configuration tables.

*Keeping `AGENTS.md` and `README.md` strictly synchronized guarantees zero documentation drift, zero token waste, and perfect codebase awareness for human developers and AI agents alike!*
