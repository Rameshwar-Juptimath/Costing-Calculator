import re


def _extract_step_material(file_path: str) -> str | None:
    """Extract material designation from STEP file ISO 10303-21 header and entities."""
    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read(500000)

        # 1. MATERIAL_DESIGNATION ('Material Name', ...)
        mat_matches = re.findall(
            r"MATERIAL_DESIGNATION\s*\(\s*'([^']+)'", content, re.IGNORECASE
        )
        for mat in mat_matches:
            cleaned = mat.strip()
            if cleaned and cleaned.lower() not in ("none", "unspecified", "unknown", "default"):
                return cleaned

        # 2. DESCRIPTIVE_REPRESENTATION_ITEM ('material...', 'Material Name')
        desc_matches = re.findall(
            r"DESCRIPTIVE_REPRESENTATION_ITEM\s*\(\s*'[^']*material[^']*'\s*,\s*'([^']+)'",
            content,
            re.IGNORECASE,
        )
        for desc in desc_matches:
            cleaned = desc.strip()
            if cleaned and cleaned.lower() not in ("none", "unspecified", "unknown"):
                return cleaned

        # 3. Known alloy keyword matching in entity attributes
        keywords = [
            "ALUMINUM 6061", "AL 6061", "AL 7075", "AL 5052", "ALUMINUM",
            "STAINLESS STEEL 304", "STAINLESS STEEL 316", "STAINLESS STEEL",
            "MILD STEEL", "STEEL 4140", "STEEL 1018", "STEEL",
            "BRASS C360", "BRASS", "COPPER", "TITANIUM", "DELRIN", "NYLON", "PEEK"
        ]
        for kw in keywords:
            if re.search(r"\b" + re.escape(kw) + r"\b", content, re.IGNORECASE):
                return kw
    except Exception:
        pass
    return None


def _process_step_sync(file_path: str, output_dir: str) -> dict:
    model = cq.importers.importStep(file_path)
    shape = model.val()
    volume = shape.Volume()
    bbox = shape.BoundingBox()

    # Extract STEP material metadata if specified
    material_name = _extract_step_material(file_path)

    # Export to GLTF/GLB via Assembly (specify exportType="GLTF")
    glb_id = str(uuid.uuid4())
    glb_path = Path(output_dir) / f"{glb_id}.glb"
    assembly = cq.Assembly()
    assembly.add(model, name="part")
    assembly.save(str(glb_path), exportType="GLTF")

    # Compute surface area if available on CadQuery shape
    surface_area = shape.Area() if hasattr(shape, "Area") else 0.0

    # Calculate part form dimensions (Bar Stock vs Sheet Metal)
    x, y, z = bbox.xlen, bbox.ylen, bbox.zlen
    dims = sorted([x, y, z])
    thickness = dims[0]
    width = dims[1]
    length = dims[2]
    sheet_area = length * width

    height = dims[2]
    diameter = (dims[0] + dims[1]) / 2.0
    radius = diameter / 2.0
    cross_section_area = math.pi * (radius ** 2)

    aspect_diff = abs(dims[1] - dims[0]) / max(dims[1], 1e-6)
    recommended_form = "bar_stock" if aspect_diff < 0.20 else "sheet"

    # Estimated Mass (using default steel density 7.85 g/cm³)
    default_density_g_cm3 = 7.85
    estimated_mass_g = round((volume / 1000.0) * default_density_g_cm3, 2)
    estimated_mass_kg = round(estimated_mass_g / 1000.0, 4)

    return {
        "geometry": {
            "volume_mm3": round(volume, 4),
            "estimated_mass_kg": estimated_mass_kg,
            "estimated_mass_g": estimated_mass_g,
            "material_name": material_name,
            "bounding_box": {
                "x_mm": round(bbox.xlen, 2),
                "y_mm": round(bbox.ylen, 2),
                "z_mm": round(bbox.zlen, 2),
            },
            "surface_area_mm2": round(surface_area, 4),
            "part_forms": {
                "bar_stock": {
                    "radius_mm": round(radius, 2),
                    "diameter_mm": round(diameter, 2),
                    "height_mm": round(height, 2),
                    "cross_section_area_mm2": round(cross_section_area, 2),
                },
                "sheet": {
                    "thickness_mm": round(thickness, 2),
                    "width_mm": round(width, 2),
                    "length_mm": round(length, 2),
                    "sheet_area_mm2": round(sheet_area, 2),
                },
                "recommended_form": recommended_form,
            },
        },
        "glb_path": str(glb_path),
        "glb_id": glb_id,
    }


async def process_step_file(file_path: str, output_dir: str) -> dict:
    """Run CadQuery (CPU-bound sync) in a thread pool to avoid blocking the event loop."""
    return await run_in_threadpool(_process_step_sync, file_path, output_dir)


def _shoelace_area(points: list) -> float:
    """Compute polygon area using the shoelace formula."""
    n = len(points)
    if n < 3:
        return 0.0
    area = sum(
        points[i][0] * points[(i + 1) % n][1] - points[(i + 1) % n][0] * points[i][1]
        for i in range(n)
    )
    return abs(area) / 2.0


def _polyline_perimeter(points: list, closed: bool) -> float:
    """Sum of Euclidean distances between consecutive vertices."""
    n = len(points)
    pairs = n if closed else n - 1
    return sum(
        math.hypot(
            points[(i + 1) % n][0] - points[i][0],
            points[(i + 1) % n][1] - points[i][1],
        )
        for i in range(pairs)
    )


def _process_dxf_sync(file_path: str) -> dict:
    try:
        doc = ezdxf.readfile(file_path)
        msp = doc.modelspace()

        entities = []
        total_area = 0.0
        total_perimeter = 0.0

        for e in msp:
            etype = e.dxftype()
            layer = e.dxf.layer
            area = 0.0
            perimeter = 0.0

            if etype == "CIRCLE":
                r = e.dxf.radius
                area = math.pi * r * r
                perimeter = 2.0 * math.pi * r

            elif etype == "ARC":
                r = e.dxf.radius
                angle_span = (e.dxf.end_angle - e.dxf.start_angle) % 360.0
                perimeter = 2.0 * math.pi * r * (angle_span / 360.0)

            elif etype == "LWPOLYLINE":
                pts = [(p[0], p[1]) for p in e.get_points()]
                if len(pts) >= 2:
                    perimeter = _polyline_perimeter(pts, closed=bool(e.closed))
                    if e.closed and len(pts) >= 3:
                        area = _shoelace_area(pts)

            elif etype == "LINE":
                s, en = e.dxf.start, e.dxf.end
                perimeter = math.sqrt(
                    (en.x - s.x) ** 2 + (en.y - s.y) ** 2 + (en.z - s.z) ** 2
                )

            elif etype in ("SPLINE", "POLYLINE"):
                try:
                    pts = [(p[0], p[1]) for p in e.flattening(sagitta=0.01)]
                    if len(pts) >= 2:
                        perimeter = _polyline_perimeter(pts, closed=False)
                except Exception:
                    pass

            else:
                continue

            entities.append({
                "type": etype,
                "layer": layer,
                "area_mm2": round(area, 4),
                "perimeter_mm": round(perimeter, 4),
            })
            total_area += area
            total_perimeter += perimeter

        return {
            "geometry": {
                "entities": entities,
                "total_area_mm2": round(total_area, 4),
                "total_perimeter_mm": round(total_perimeter, 4),
                "drawing_units": "mm",
            },
            "glb_path": None,
            "glb_id": None,
        }
    except Exception:
        # Fallback for binary 2D CAD formats (DWG / DWF)
        return {
            "geometry": {
                "entities": [{"type": "DRAWING_2D", "layer": "0", "area_mm2": 0.0, "perimeter_mm": 0.0}],
                "total_area_mm2": 0.0,
                "total_perimeter_mm": 0.0,
                "drawing_units": "mm",
            },
            "glb_path": None,
            "glb_id": None,
        }


async def process_dxf_file(file_path: str) -> dict:
    """Run ezdxf (CPU-bound sync) in a thread pool to avoid blocking the event loop."""
    return await run_in_threadpool(_process_dxf_sync, file_path)
