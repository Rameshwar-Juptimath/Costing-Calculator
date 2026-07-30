# API Contract — Manufacturing Costing Engine

> **Status**: Authoritative reference. All backend endpoints and frontend fetch calls must strictly conform to this document.
> **Currency**: All monetary values are in **INR (₹)**. No currency conversion is performed.
> **File Upload Limit**: 100 MB
> **Base URL**: `http://localhost:8000/api/v1` (dev) | `http://backend:8000/api/v1` (Docker internal)

---

## Authentication

### Token Format
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

JWT payload (decoded):
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "email": "user@example.com",
  "role": "admin",
  "tier": "Basic",
  "exp": 1234567890
}
```

---

## 1. Auth Endpoints

### `POST /api/v1/auth/login`
**Auth required**: No

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "Admin@123!"
}
```

**Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "tenant_id": "uuid",
    "tenant_name": "ACME Manufacturing"
  }
}
```

**Response `401 Unauthorized`**:
```json
{ "detail": "Invalid email or password" }
```

---

### `GET /api/v1/auth/me`
**Auth required**: Yes

**Response `200 OK`**:
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "role": "admin",
  "tenant_id": "uuid",
  "tenant_name": "ACME Manufacturing",
  "tier": "Basic",
  "features": {
    "can_access_direct_cost": true,
    "can_access_overhead_cost": false,
    "can_access_tax": false,
    "can_access_profit_margin": false
  }
}
```

> **Note**: The `features` object drives all frontend `<FeatureGate>` decisions. Fetch this on app load and store in Zustand.

---

## 2. CAD Endpoints

### `POST /api/v1/cad/upload`
**Auth required**: Yes
**Feature gate**: `can_access_direct_cost` (both tiers)
**Content-Type**: `multipart/form-data`
**Max file size**: 100 MB

**Request (form fields)**:
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | `.step`, `.stp`, or `.dxf` file |

**Response `200 OK`** (STEP file):
```json
{
  "estimate_id": "uuid",
  "filename": "bracket.step",
  "file_type": "step",
  "geometry": {
    "volume_mm3": 8500.25,
    "bounding_box": {
      "x_mm": 45.0,
      "y_mm": 30.0,
      "z_mm": 15.0
    },
    "surface_area_mm2": 4200.0
  },
  "mesh_url": "/api/v1/cad/mesh/uuid"
}
```

**Response `200 OK`** (DXF file):
```json
{
  "estimate_id": "uuid",
  "filename": "flange.dxf",
  "file_type": "dxf",
  "geometry": {
    "entities": [
      { "type": "LWPOLYLINE", "layer": "0", "area_mm2": 1256.6, "perimeter_mm": 125.7 },
      { "type": "CIRCLE", "layer": "HOLES", "area_mm2": 78.5, "perimeter_mm": 31.4 }
    ],
    "total_area_mm2": 1335.1,
    "total_perimeter_mm": 157.1,
    "drawing_units": "mm"
  },
  "mesh_url": null
}
```

**Response `400 Bad Request`** (unsupported file type):
```json
{ "detail": "Unsupported file type. Only .step, .stp, and .dxf are accepted." }
```

**Response `413 Request Entity Too Large`**:
```json
{ "detail": "File size exceeds 100 MB limit." }
```

---

### `GET /api/v1/cad/mesh/{estimate_id}`
**Auth required**: Yes
**Response**: Binary GLB file (`Content-Type: model/gltf-binary`)

Used by `<CADViewer>` to load the 3D mesh via `useGLTF`.

---

## 3. Costing Endpoints

### `POST /api/v1/cost/calculate`
**Auth required**: Yes
**Feature gate**: Fields are silently zeroed server-side if the feature is not enabled (no 403 — the engine enforces tier limits).

**Request Body**:
```json
{
  "estimate_id": "uuid",
  "currency": "INR",
  "direct_cost": {
    "raw_material": 12500.00,
    "tooling": 3200.00,
    "manufacturing": 8000.00,
    "labour": 4500.00,
    "inspection": 1200.00,
    "logistics": 800.00
  },
  "overhead_cost": {
    "factory_rent": 5000.00,
    "machinery_asset": 2000.00,
    "electricity": 800.00,
    "telecom": 200.00,
    "admin": 500.00,
    "fixed_salary": 3000.00,
    "expenses": 300.00
  },
  "commercials": {
    "tax_rate": 18.0,
    "profit_margin_rate": 15.0
  }
}
```

> **Note**: Basic tier users must send zeroes for `overhead_cost` and `commercials` fields. The server will ignore them regardless, but the frontend must not populate them.

**Response `200 OK`** (Basic tier):
```json
{
  "estimate_id": "uuid",
  "currency": "INR",
  "currency_symbol": "₹",
  "breakdown": {
    "direct_cost": {
      "raw_material": 12500.00,
      "tooling": 3200.00,
      "manufacturing": 8000.00,
      "labour": 4500.00,
      "inspection": 1200.00,
      "logistics": 800.00,
      "subtotal": 30200.00
    },
    "overhead_cost": null,
    "commercials": null
  },
  "totals": {
    "direct_subtotal": 30200.00,
    "overhead_subtotal": 0.00,
    "pre_tax_total": 30200.00,
    "tax_amount": 0.00,
    "margin_amount": 0.00,
    "grand_total": 30200.00
  },
  "tier_applied": "Basic"
}
```

**Response `200 OK`** (Pro tier):
```json
{
  "estimate_id": "uuid",
  "currency": "INR",
  "currency_symbol": "₹",
  "breakdown": {
    "direct_cost": {
      "raw_material": 12500.00,
      "tooling": 3200.00,
      "manufacturing": 8000.00,
      "labour": 4500.00,
      "inspection": 1200.00,
      "logistics": 800.00,
      "subtotal": 30200.00
    },
    "overhead_cost": {
      "factory_rent": 5000.00,
      "machinery_asset": 2000.00,
      "electricity": 800.00,
      "telecom": 200.00,
      "admin": 500.00,
      "fixed_salary": 3000.00,
      "expenses": 300.00,
      "subtotal": 11800.00
    },
    "commercials": {
      "pre_tax_base": 42000.00,
      "tax_rate": 18.0,
      "tax_amount": 7560.00,
      "profit_margin_rate": 15.0,
      "margin_amount": 6300.00
    }
  },
  "totals": {
    "direct_subtotal": 30200.00,
    "overhead_subtotal": 11800.00,
    "pre_tax_total": 42000.00,
    "tax_amount": 7560.00,
    "margin_amount": 6300.00,
    "grand_total": 55860.00
  },
  "tier_applied": "Pro"
}
```

> **Math verification**:
> - `direct_subtotal` = sum of all direct_cost fields
> - `overhead_subtotal` = sum of all overhead_cost fields (Pro only)
> - `pre_tax_total` = direct_subtotal + overhead_subtotal
> - `tax_amount` = pre_tax_total × tax_rate / 100 (Pro only)
> - `margin_amount` = pre_tax_total × profit_margin_rate / 100 (Pro only)
> - `grand_total` = pre_tax_total + tax_amount + margin_amount

---

### `GET /api/v1/cost/estimates`
**Auth required**: Yes (RLS automatically scopes to tenant)

**Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "uuid",
      "filename": "bracket.step",
      "file_type": "step",
      "grand_total": 55860.00,
      "currency": "INR",
      "tier_applied": "Pro",
      "created_at": "2026-07-30T12:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 4. Health Endpoint

### `GET /health`
**Auth required**: No
```json
{ "status": "ok", "service": "costing-engine-backend" }
```

---

## 5. Error Response Format

All errors follow this schema:
```json
{
  "detail": "Human-readable error message"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Bad request (validation failure, unsupported file type) |
| 401 | Missing or invalid JWT |
| 403 | Feature not available on current tier |
| 404 | Resource not found |
| 413 | File too large (>100 MB) |
| 422 | Pydantic validation error (request body schema mismatch) |
| 500 | Internal server error |

---

## 6. Frontend Zustand Store Shape

The frontend `costingStore.ts` must maintain this shape (populated from `/auth/me`):

```typescript
interface UserFeatures {
  can_access_direct_cost: boolean;
  can_access_overhead_cost: boolean;
  can_access_tax: boolean;
  can_access_profit_margin: boolean;
}

interface CostingStore {
  // Auth
  user: AuthUser | null;
  features: UserFeatures | null;

  // CAD upload state
  estimateId: string | null;
  geometry: GeometryData | null;
  meshUrl: string | null;

  // Wizard state (persisted across steps)
  directCost: DirectCostFields;
  overheadCost: OverheadCostFields;
  commercials: CommercialsFields;
  currentStep: 1 | 2 | 3;

  // Result
  costResult: CostResult | null;
}
```
