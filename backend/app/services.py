import base64
import os
import struct
import zipfile
from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

try:
    from openpyxl import Workbook
except ImportError:  # pragma: no cover - optional dependency
    Workbook = None

from app import models
from app.config import DEFAULT_FLOOR_HEIGHT, STORAGE_DIR


def _safe_text(value: Optional[str], fallback: str = "") -> str:
    return value if value is not None else fallback


def _safe_number(value: Optional[str], fallback: float) -> float:
    if value is None:
        return fallback
    digits = "".join([char for char in str(value) if (char.isdigit() or char == ".")])
    if not digits:
        return fallback
    try:
        return float(digits)
    except ValueError:
        return fallback


def _ensure_storage(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _write_file(path: str, content: str) -> None:
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(content)


def _write_binary(path: str, content: bytes) -> None:
    with open(path, "wb") as handle:
        handle.write(content)


def _compute_massing(project: models.Project) -> dict:
    floors = _safe_number(project.floors, 8)
    gfa = _safe_number(project.gfa, 18000)
    floor_area = gfa / max(floors, 1)

    building_type = (project.building_type or "").lower()
    region = (project.region or "").lower()

    ratio = 1.2
    module = 7.5
    default_core_ratio = 0.24

    if "residential" in building_type or "apartment" in building_type:
        ratio = 1.55
        module = 6.0
        default_core_ratio = 0.18
    elif "hospital" in building_type or "health" in building_type:
        ratio = 1.25
        module = 8.0
        default_core_ratio = 0.28
    elif "education" in building_type:
        ratio = 1.4
        module = 7.2
        default_core_ratio = 0.22
    elif "hospitality" in building_type or "hotel" in building_type:
        ratio = 1.3
        module = 6.8
        default_core_ratio = 0.2
    elif "mixed" in building_type:
        ratio = 1.28
        module = 7.2
        default_core_ratio = 0.24

    if "egypt" in region:
        module *= 0.95

    width = max((floor_area ** 0.5) / ratio, 18)
    depth = max((floor_area ** 0.5) * ratio, 14)

    core_ratio = _safe_number(project.core_ratio, default_core_ratio * 100) / 100
    core_ratio = min(max(core_ratio, 0.12), 0.35)

    grid_x = max(int(width / module) + 1, 3)
    grid_y = max(int(depth / module) + 1, 3)

    return {
        "width": width,
        "depth": depth,
        "height": max(floors * DEFAULT_FLOOR_HEIGHT, 12),
        "floors": floors,
        "floor_area": floor_area,
        "core_ratio": core_ratio,
        "module": module,
        "grid_x": grid_x,
        "grid_y": grid_y,
    }


def _build_plan_svg(project: models.Project, massing: Optional[dict] = None) -> str:
    if massing is None:
        massing = _compute_massing(project)
    width = massing["width"]
    depth = massing["depth"]
    core_ratio = massing["core_ratio"]
    grid_x = massing["grid_x"]
    grid_y = massing["grid_y"]

    core_width = width * 0.32
    core_area = width * depth * core_ratio
    core_depth = min(core_area / max(core_width, 1), depth * 0.6)
    core_x = (width - core_width) / 2
    core_y = (depth - core_depth) / 2

    grid_lines = []
    for i in range(grid_x):
        x = 0.5 + i * (width - 1) / (grid_x - 1)
        grid_lines.append(
            f"<line x1='{x:.2f}' y1='0.5' x2='{x:.2f}' y2='{depth - 0.5:.2f}' "
            "stroke='#e0d2c2' stroke-width='0.35' />"
        )
    for j in range(grid_y):
        y = 0.5 + j * (depth - 1) / (grid_y - 1)
        grid_lines.append(
            f"<line x1='0.5' y1='{y:.2f}' x2='{width - 0.5:.2f}' y2='{y:.2f}' "
            "stroke='#e0d2c2' stroke-width='0.35' />"
        )

    columns = []
    for i in range(grid_x):
        x = 0.5 + i * (width - 1) / (grid_x - 1)
        for j in range(grid_y):
            y = 0.5 + j * (depth - 1) / (grid_y - 1)
            columns.append(
                f"<circle cx='{x:.2f}' cy='{y:.2f}' r='0.35' fill='#c9b9aa' />"
            )

    return (
        f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {width:.2f} {depth:.2f}'>"
        f"<rect x='0.5' y='0.5' width='{width - 1:.2f}' height='{depth - 1:.2f}' "
        "fill='#fbf6ef' stroke='#c7b8a8' stroke-width='0.6' />"
        f"<rect x='{core_x:.2f}' y='{core_y:.2f}' width='{core_width:.2f}' height='{core_depth:.2f}' "
        "fill='#e6d9cb' stroke='#b8a897' stroke-width='0.5' />"
        + "".join(grid_lines)
        + "".join(columns)
        + "</svg>"
    )


def _build_ifc_stub(project: models.Project) -> str:
    name = project.name or "AI Designer Project"
    return (
        "ISO-10303-21;\n"
        "HEADER;\n"
        "FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'), '2;1');\n"
        "FILE_NAME('AIDesigner.ifc','2025-01-01T00:00:00',('AI Designer'),('AI Designer'),'', '', '');\n"
        "FILE_SCHEMA(('IFC4'));\n"
        "ENDSEC;\n"
        "DATA;\n"
        f"#1=IFCPROJECT('0hY3YQnS92X9QkK7CzA1gG',$,'{name}',$,$,$,$,(#2),#3);\n"
        "#2=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,0.0001,#4,$);\n"
        "#3=IFCUNITASSIGNMENT((#5,#6,#7));\n"
        "#4=IFCAXIS2PLACEMENT3D(#8,#9,#10);\n"
        "#5=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);\n"
        "#6=IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.);\n"
        "#7=IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.);\n"
        "#8=IFCCARTESIANPOINT((0.,0.,0.));\n"
        "#9=IFCDIRECTION((0.,0.,1.));\n"
        "#10=IFCDIRECTION((1.,0.,0.));\n"
        "ENDSEC;\n"
        "END-ISO-10303-21;\n"
    )


def _build_gltf_stub(project: models.Project) -> str:
    massing = _compute_massing(project)
    width = massing["width"]
    depth = massing["depth"]
    height = massing["height"]

    positions = [
        -0.5,
        0.0,
        -0.5,
        0.5,
        0.0,
        -0.5,
        0.5,
        0.0,
        0.5,
        -0.5,
        0.0,
        0.5,
        -0.5,
        1.0,
        -0.5,
        0.5,
        1.0,
        -0.5,
        0.5,
        1.0,
        0.5,
        -0.5,
        1.0,
        0.5,
    ]

    indices = [
        0,
        1,
        2,
        2,
        3,
        0,
        4,
        5,
        6,
        6,
        7,
        4,
        0,
        1,
        5,
        5,
        4,
        0,
        1,
        2,
        6,
        6,
        5,
        1,
        2,
        3,
        7,
        7,
        6,
        2,
        3,
        0,
        4,
        4,
        7,
        3,
    ]

    pos_bytes = struct.pack("<" + "f" * len(positions), *positions)
    idx_bytes = struct.pack("<" + "H" * len(indices), *indices)
    buffer = pos_bytes + idx_bytes
    encoded = base64.b64encode(buffer).decode("ascii")

    return f"""{{
  "asset": {{ "version": "2.0", "generator": "AI Designer" }},
  "scene": 0,
  "scenes": [{{ "nodes": [0] }}],
  "nodes": [{{ "mesh": 0, "scale": [{width:.2f}, {height:.2f}, {depth:.2f}] }}],
  "meshes": [{{
    "primitives": [{{
      "attributes": {{ "POSITION": 0 }},
      "indices": 1
    }}]
  }}],
  "buffers": [{{
    "uri": "data:application/octet-stream;base64,{encoded}",
    "byteLength": {len(buffer)}
  }}],
  "bufferViews": [
    {{ "buffer": 0, "byteOffset": 0, "byteLength": {len(pos_bytes)} }},
    {{ "buffer": 0, "byteOffset": {len(pos_bytes)}, "byteLength": {len(idx_bytes)} }}
  ],
  "accessors": [
    {{
      "bufferView": 0,
      "componentType": 5126,
      "count": 8,
      "type": "VEC3",
      "min": [-0.5, 0.0, -0.5],
      "max": [0.5, 1.0, 0.5]
    }},
    {{
      "bufferView": 1,
      "componentType": 5123,
      "count": {len(indices)},
      "type": "SCALAR"
    }}
  ]
}}"""


def _write_schedule(path: str, project: models.Project, massing: dict) -> None:
    lines = [
        "Section,Item,Value",
        f"Summary,Project,{project.name}",
        f"Summary,Region,{project.region}",
        f"Summary,Building Type,{project.building_type}",
        f"Summary,GFA (m2),{_safe_number(project.gfa, massing['floor_area'] * massing['floors']):.0f}",
        f"Summary,Floors,{massing['floors']:.0f}",
    ]

    if Workbook is None:
        _write_file(path, "\n".join(lines))
        return

    workbook = Workbook()
    summary = workbook.active
    summary.title = "Summary"
    summary.append(["Section", "Item", "Value"])
    summary.append(["Summary", "Project", project.name])
    summary.append(["Summary", "Region", project.region])
    summary.append(["Summary", "Building Type", project.building_type])
    summary.append(["Summary", "Floor Plate (m2)", f"{massing['floor_area']:.0f}"])
    summary.append(
        [
            "Summary",
            "GFA (m2)",
            f"{_safe_number(project.gfa, massing['floor_area'] * massing['floors']):.0f}",
        ]
    )
    summary.append(["Summary", "Floors", f"{massing['floors']:.0f}"])

    structure = workbook.create_sheet("Structure")
    grid_x = massing["grid_x"]
    grid_y = massing["grid_y"]
    column_count = grid_x * grid_y * int(max(massing["floors"], 1))
    structure.append(["Item", "Value"])
    structure.append(["Grid X", grid_x])
    structure.append(["Grid Y", grid_y])
    structure.append(["Module (m)", f"{massing['module']:.1f}"])
    structure.append(["Estimated Columns", column_count])

    mep = workbook.create_sheet("MEP")
    mep.append(["Item", "Value"])
    mep.append(["Risers", 4])
    mep.append(["HVAC Zones", max(int(massing["floors"] / 3), 3)])
    mep.append(["Electrical Panels", max(int(massing["floors"] / 4), 2)])

    workbook.save(path)


def _pdf_escape(text: str) -> str:
    safe_text = text.encode("latin-1", "ignore").decode("latin-1")
    return safe_text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_pdf_report(lines: List[str]) -> bytes:
    content_lines = ["BT", "/F1 12 Tf", "72 740 Td"]
    for line in lines:
        content_lines.append(f"({_pdf_escape(line)}) Tj")
        content_lines.append("0 -14 Td")
    content_lines.append("ET")
    content = "\n".join(content_lines)
    content_bytes = content.encode("latin-1")

    objects = []
    objects.append("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n")
    objects.append("2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n")
    objects.append(
        "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n"
    )
    objects.append(
        f"4 0 obj<< /Length {len(content_bytes)} >>stream\n{content}\nendstream\nendobj\n"
    )
    objects.append("5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n")

    pdf = "%PDF-1.4\n"
    offsets = []
    for obj in objects:
        offsets.append(len(pdf))
        pdf += obj

    xref_start = len(pdf)
    pdf += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n"
    for offset in offsets:
        pdf += f"{offset:010d} 00000 n \n"
    pdf += (
        f"trailer<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_start}\n%%EOF\n"
    )

    return pdf.encode("latin-1")


def _write_review_package(run_dir: str, package_name: str, files: list[str]) -> None:
    package_path = os.path.join(run_dir, package_name)
    with zipfile.ZipFile(package_path, "w") as archive:
        for file_name in files:
            file_path = os.path.join(run_dir, file_name)
            if os.path.exists(file_path):
                archive.write(file_path, arcname=file_name)


def apply_state_payload(
    db: Session, payload
) -> Tuple[models.Project, Optional[models.Run], Optional[models.Output]]:
    project = None
    if payload.project.id:
        project = db.query(models.Project).filter(models.Project.id == payload.project.id).first()
    if not project:
        project = models.Project(name=payload.project.name)
        db.add(project)

    project.name = payload.project.name
    project.region = _safe_text(payload.project.region)
    project.building_type = _safe_text(payload.project.type)
    project.phase = _safe_text(payload.project.phase)
    project.gfa = _safe_text(payload.project.gfa)
    project.floors = _safe_text(payload.project.floors)
    project.status = _safe_text(payload.project.status)
    project.next_run = _safe_text(payload.project.next_run)
    project.brief = _safe_text(payload.project.brief)
    project.core_ratio = _safe_text(payload.project.core_ratio)
    project.parking = _safe_text(payload.project.parking)
    project.budget = _safe_text(payload.project.budget)
    project.delivery = _safe_text(payload.project.delivery)
    project.code_library = _safe_text(payload.project.code_library)
    project.energy_target = _safe_text(payload.project.energy_target)
    project.daylight = _safe_text(payload.project.daylight)
    project.structural_system = _safe_text(payload.project.structural_system)
    project.mep_strategy = _safe_text(payload.project.mep_strategy)
    project.site_model = _safe_text(payload.project.site_model)

    run = None
    if payload.run:
        if payload.run.id:
            run = db.query(models.Run).filter(models.Run.id == payload.run.id).first()
        if not run:
            run = models.Run(project=project)
            db.add(run)
        run.status = _safe_text(payload.run.status)
        run.conflicts = _safe_text(payload.run.conflicts)

    output = None
    if payload.outputs:
        if payload.outputs.id:
            output = db.query(models.Output).filter(models.Output.id == payload.outputs.id).first()
        if not output and run:
            output = models.Output(run=run)
            db.add(output)
        if output:
            output.clash_density = _safe_text(payload.outputs.clash_density)
            output.structural_variance = _safe_text(payload.outputs.structural_variance)
            output.compliance = _safe_text(payload.outputs.compliance)
            output.energy = _safe_text(payload.outputs.energy)
            output.clash_free = payload.outputs.clash_free or 0
            output.energy_score = payload.outputs.energy_score or 0
            output.structural_score = payload.outputs.structural_score or 0
            output.ifc_file = _safe_text(payload.outputs.ifc_file)
            output.mep_schedule_file = _safe_text(payload.outputs.mep_schedule_file)
            output.energy_report_file = _safe_text(payload.outputs.energy_report_file)
            output.review_package_file = _safe_text(payload.outputs.review_package_file)
            output.plan_svg_file = _safe_text(payload.outputs.plan_svg_file)
            output.gltf_file = _safe_text(payload.outputs.gltf_file)
            output.generated_at = _safe_text(payload.outputs.generated_at)

    db.commit()
    db.refresh(project)
    if run:
        db.refresh(run)
    if output:
        db.refresh(output)
    return project, run, output


def get_latest_state(
    db: Session,
) -> Tuple[Optional[models.Project], Optional[models.Run], Optional[models.Output]]:
    project = db.query(models.Project).order_by(models.Project.created_at.desc()).first()
    if not project:
        return None, None, None
    run = (
        db.query(models.Run)
        .filter(models.Run.project_id == project.id)
        .order_by(models.Run.created_at.desc())
        .first()
    )
    output = None
    if run:
        output = db.query(models.Output).filter(models.Output.run_id == run.id).first()
    return project, run, output


def start_run(
    db: Session, project_id: Optional[str]
) -> Tuple[models.Project, models.Run, models.Output]:
    if project_id:
        project = db.query(models.Project).filter(models.Project.id == project_id).first()
    else:
        project = db.query(models.Project).order_by(models.Project.created_at.desc()).first()

    if not project:
        raise ValueError("Project not found")

    run = models.Run(project=project, status="In progress", conflicts="Scanning")
    run.started_at = datetime.utcnow()
    db.add(run)
    db.flush()

    output = models.Output(run=run)
    db.add(output)
    db.flush()

    project.status = "Running"
    project.next_run = "Orchestrator active"

    db.commit()
    db.refresh(project)
    db.refresh(run)
    db.refresh(output)

    return project, run, output
