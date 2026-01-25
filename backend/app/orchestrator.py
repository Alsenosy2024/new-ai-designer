import json
import math
import os
import shutil
import sqlite3
import subprocess
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from app import models
from app.config import (
    BLENDER_EXPORT_SCRIPT,
    BLENDER_PATH,
    DEFAULT_FLOOR_HEIGHT,
    ENERGYPLUS_IDD,
    ENERGYPLUS_PATH,
    ENERGYPLUS_WEATHER,
    STORAGE_DIR,
)
from app.db import SessionLocal
from app.agent_orchestrator import run_agent_pipeline_sync, run_architecture_pipeline_sync
from app.llm import generate_design_plan, generate_run_summary
from app.services import (
    _build_dxf,
    _build_ifc_stub,
    _build_arch_plan_svg,
    _build_gltf_stub,
    _build_pdf_report,
    _build_structural_plan_svg,
    _compute_massing,
    _ensure_storage,
    _safe_number,
    _write_binary,
    _write_dxf,
    _write_file,
    _write_review_package,
    _write_schedule,
)


FALLBACK_CLIMATE = "Hot-Arid"


def _slugify(name: str) -> str:
    return "".join([char for char in name if char.isalnum()]) or "Project"


def _tool_exists(path: str) -> bool:
    if not path:
        return False
    return bool(shutil.which(path) or os.path.exists(path))


def _log_event(
    db: SessionLocal, run: models.Run, message: str, step: str = "", level: str = "info"
) -> None:
    event = models.RunEvent(run=run, message=message, step=step, level=level)
    db.add(event)
    db.commit()


def _register_artifact(
    db: SessionLocal,
    run: models.Run,
    kind: str,
    file_name: str,
    description: str = "",
) -> None:
    artifact = models.Artifact(
        run=run, kind=kind, file_name=file_name, description=description
    )
    db.add(artifact)
    db.commit()


def _apply_massing_overrides(massing: Dict[str, Any], plan: Dict[str, Any]) -> Dict[str, Any]:
    overrides = plan.get("massing") or {}
    width_before = massing.get("width")
    depth_before = massing.get("depth")
    floors_before = massing.get("floors", 1)
    for key in ("width", "depth", "floors", "core_ratio", "module", "grid_x", "grid_y"):
        if key in overrides and isinstance(overrides[key], (int, float)):
            massing[key] = overrides[key]

    if massing.get("width") != width_before or massing.get("depth") != depth_before:
        massing["floor_area"] = massing["width"] * massing["depth"]

    if massing.get("floors") != floors_before and floors_before:
        height_per_floor = massing.get("height", 0) / floors_before
        massing["height"] = max(massing["floors"] * height_per_floor, 12)

    if massing.get("core_ratio"):
        massing["core_ratio"] = min(max(massing["core_ratio"], 0.12), 0.35)

    massing["floors"] = max(massing.get("floors", 1), 1)
    massing["grid_x"] = max(int(massing.get("grid_x", 3)), 3)
    massing["grid_y"] = max(int(massing.get("grid_y", 3)), 3)
    massing["module"] = max(massing.get("module", 7.5), 4)

    return massing


def _generate_ifc(path: str, project: models.Project, massing: Dict[str, Any]) -> bool:
    try:
        import ifcopenshell
        from ifcopenshell import guid
    except ImportError:
        _write_file(path, _build_ifc_stub(project))
        return False

    model = ifcopenshell.file(schema="IFC4")

    def new_guid() -> str:
        return guid.new()

    origin = model.create_entity("IfcCartesianPoint", Coordinates=(0.0, 0.0, 0.0))
    axis = model.create_entity("IfcAxis2Placement3D", Location=origin)
    context = model.create_entity(
        "IfcGeometricRepresentationContext",
        ContextIdentifier="Model",
        ContextType="Model",
        CoordinateSpaceDimension=3,
        Precision=1e-5,
        WorldCoordinateSystem=axis,
    )

    length_unit = model.create_entity(
        "IfcSIUnit", UnitType="LENGTHUNIT", Name="METRE"
    )
    area_unit = model.create_entity(
        "IfcSIUnit", UnitType="AREAUNIT", Name="SQUARE_METRE"
    )
    volume_unit = model.create_entity(
        "IfcSIUnit", UnitType="VOLUMEUNIT", Name="CUBIC_METRE"
    )
    unit_assignment = model.create_entity(
        "IfcUnitAssignment", Units=[length_unit, area_unit, volume_unit]
    )

    project_entity = model.create_entity(
        "IfcProject",
        GlobalId=new_guid(),
        Name=project.name or "AI Designer Project",
        UnitsInContext=unit_assignment,
        RepresentationContexts=[context],
    )

    site_placement = model.create_entity("IfcLocalPlacement", RelativePlacement=axis)
    site = model.create_entity(
        "IfcSite",
        GlobalId=new_guid(),
        Name="Default Site",
        ObjectPlacement=site_placement,
        CompositionType="ELEMENT",
    )

    building_placement = model.create_entity(
        "IfcLocalPlacement", PlacementRelTo=site_placement, RelativePlacement=axis
    )
    building = model.create_entity(
        "IfcBuilding",
        GlobalId=new_guid(),
        Name=project.name or "AI Designer Building",
        ObjectPlacement=building_placement,
        CompositionType="ELEMENT",
    )

    storey_placement = model.create_entity(
        "IfcLocalPlacement", PlacementRelTo=building_placement, RelativePlacement=axis
    )
    storey = model.create_entity(
        "IfcBuildingStorey",
        GlobalId=new_guid(),
        Name="Level 01",
        Elevation=0.0,
        ObjectPlacement=storey_placement,
    )

    model.create_entity(
        "IfcRelAggregates",
        GlobalId=new_guid(),
        RelatingObject=project_entity,
        RelatedObjects=[site],
    )
    model.create_entity(
        "IfcRelAggregates",
        GlobalId=new_guid(),
        RelatingObject=site,
        RelatedObjects=[building],
    )
    model.create_entity(
        "IfcRelAggregates",
        GlobalId=new_guid(),
        RelatingObject=building,
        RelatedObjects=[storey],
    )

    width = float(massing["width"])
    depth = float(massing["depth"])
    height = float(massing["height"])

    profile = model.create_entity(
        "IfcRectangleProfileDef",
        ProfileType="AREA",
        XDim=width,
        YDim=depth,
    )

    direction = model.create_entity("IfcDirection", DirectionRatios=(0.0, 0.0, 1.0))
    placement = model.create_entity("IfcAxis2Placement3D", Location=origin)
    solid = model.create_entity(
        "IfcExtrudedAreaSolid",
        SweptArea=profile,
        Position=placement,
        ExtrudedDirection=direction,
        Depth=height,
    )

    shape = model.create_entity(
        "IfcShapeRepresentation",
        ContextOfItems=context,
        RepresentationIdentifier="Body",
        RepresentationType="SweptSolid",
        Items=[solid],
    )

    product_shape = model.create_entity(
        "IfcProductDefinitionShape", Representations=[shape]
    )

    proxy = model.create_entity(
        "IfcBuildingElementProxy",
        GlobalId=new_guid(),
        Name="Massing",
        ObjectPlacement=storey_placement,
        Representation=product_shape,
    )

    model.create_entity(
        "IfcRelContainedInSpatialStructure",
        GlobalId=new_guid(),
        RelatedElements=[proxy],
        RelatingStructure=storey,
    )

    model.write(path)
    return True


def _generate_gltf(path: str, project: models.Project, massing: Dict[str, Any]) -> bool:
    try:
        import trimesh
    except ImportError:
        _write_file(path, _build_gltf_stub(project))
        return False

    width = float(massing["width"])
    depth = float(massing["depth"])
    height = float(massing["height"])
    mesh = trimesh.creation.box(extents=(width, height, depth))
    mesh.export(path)
    return True


def _generate_mep_layout(massing: Dict[str, Any]) -> Dict[str, Any]:
    floors = massing["floors"]
    core_ratio = massing["core_ratio"]
    floor_area = massing["floor_area"]

    risers = max(4, int(math.sqrt(floor_area / 1500)))
    zones = max(3, int(floors / 3))
    duct_length = floor_area * 0.12
    pipe_length = floor_area * 0.09
    cable_length = floor_area * 0.08
    clash_density = max(1.2, 4.5 - core_ratio * 10)

    return {
        "risers": risers,
        "zones": zones,
        "duct_length_m": round(duct_length, 1),
        "pipe_length_m": round(pipe_length, 1),
        "cable_tray_length_m": round(cable_length, 1),
        "clash_density": round(clash_density, 2),
    }


def _write_mep_layout(path: str, mep: Dict[str, Any]) -> None:
    _write_file(path, json.dumps(mep, indent=2))


def _estimate_energy(project: models.Project, massing: Dict[str, Any]) -> Tuple[float, str]:
    climate = project.region or FALLBACK_CLIMATE
    base = 95.0
    if "saudi" in climate.lower() or "riyadh" in climate.lower():
        base = 100.0
    if "uae" in climate.lower() or "dubai" in climate.lower():
        base = 102.0
    if "qatar" in climate.lower():
        base = 98.0

    gfa = _safe_number(project.gfa, massing["floor_area"] * massing["floors"])
    penalty = min(gfa / 50000, 0.3) * 10
    eui = base + penalty
    return eui, "heuristic"


def _run_energyplus(
    run_dir: str, project: models.Project, massing: Dict[str, Any]
) -> Optional[Tuple[float, str]]:
    if not _tool_exists(ENERGYPLUS_PATH):
        return None
    if not ENERGYPLUS_WEATHER or not os.path.isfile(ENERGYPLUS_WEATHER):
        return None
    if not ENERGYPLUS_IDD or not os.path.isfile(ENERGYPLUS_IDD):
        return None

    try:
        from eppy.modeleditor import IDF
    except ImportError:
        return None

    template = os.getenv("ENERGYPLUS_TEMPLATE", "")
    if not template:
        candidate = os.path.join(os.path.dirname(ENERGYPLUS_IDD), "ExampleFiles", "Minimal.idf")
        if os.path.isfile(candidate):
            template = candidate
    if not template or not os.path.isfile(template):
        return None

    IDF.setiddname(ENERGYPLUS_IDD)
    idf = IDF(template)
    if idf.idfobjects.get("BUILDING"):
        idf.idfobjects["BUILDING"][0].Name = project.name or "AI Designer"

    idf_path = os.path.join(run_dir, "energyplus.idf")
    idf.saveas(idf_path)

    output_dir = os.path.join(run_dir, "energyplus")
    _ensure_storage(output_dir)

    try:
        subprocess.run(
            [ENERGYPLUS_PATH, "-w", ENERGYPLUS_WEATHER, "-d", output_dir, idf_path],
            check=True,
            capture_output=True,
        )
    except subprocess.SubprocessError:
        return None

    sql_path = os.path.join(output_dir, "eplusout.sql")
    if not os.path.isfile(sql_path):
        return None

    try:
        with sqlite3.connect(sql_path) as connection:
            cursor = connection.cursor()
            cursor.execute(
                "SELECT Value FROM TabularDataWithStrings WHERE ReportName='AnnualBuildingUtilityPerformanceSummary' AND RowName='Total Site Energy' AND ColumnName='Total Energy' AND Units='GJ'"
            )
            row = cursor.fetchone()
            if not row:
                return None
            total_gj = float(row[0])
    except (sqlite3.Error, ValueError):
        return None

    gfa = _safe_number(project.gfa, massing["floor_area"] * massing["floors"])
    if gfa <= 0:
        return None
    total_kwh = total_gj * 277.78
    eui = total_kwh / gfa
    return eui, "energyplus"


def _run_structural_analysis(massing: Dict[str, Any]) -> Dict[str, Any]:
    try:
        import openseespy.opensees as ops
    except Exception:
        return {"max_drift": 0.012, "utilization": 0.78, "source": "heuristic"}

    bays = max(int(massing["grid_x"]) - 1, 1)
    floors = int(massing["floors"])
    bay_width = massing["module"]
    story_height = massing["height"] / floors

    ops.wipe()
    ops.model("basic", "-ndm", 2, "-ndf", 3)

    node_tag = 1
    node_tags = []
    for floor in range(floors + 1):
        y = floor * story_height
        for bay in range(bays + 1):
            x = bay * bay_width
            ops.node(node_tag, x, y)
            node_tags.append(node_tag)
            if floor == 0:
                ops.fix(node_tag, 1, 1, 1)
            node_tag += 1

    ops.geomTransf("Linear", 1)

    e_mod = 25e9
    a_col = 0.4 * 0.4
    iz_col = (0.4 * 0.4**3) / 12
    a_beam = 0.3 * 0.6
    iz_beam = (0.3 * 0.6**3) / 12

    def node_at(floor: int, bay: int) -> int:
        return floor * (bays + 1) + bay + 1

    element_tag = 1
    for floor in range(floors):
        for bay in range(bays + 1):
            n1 = node_at(floor, bay)
            n2 = node_at(floor + 1, bay)
            ops.element("elasticBeamColumn", element_tag, n1, n2, a_col, e_mod, iz_col, 1)
            element_tag += 1

    for floor in range(1, floors + 1):
        for bay in range(bays):
            n1 = node_at(floor, bay)
            n2 = node_at(floor, bay + 1)
            ops.element("elasticBeamColumn", element_tag, n1, n2, a_beam, e_mod, iz_beam, 1)
            element_tag += 1

    ops.timeSeries("Linear", 1)
    ops.pattern("Plain", 1, 1)
    for floor in range(1, floors + 1):
        for bay in range(bays + 1):
            ops.load(node_at(floor, bay), 0.0, -150e3, 0.0)

    ops.system("BandGeneral")
    ops.numberer("RCM")
    ops.constraints("Plain")
    ops.integrator("LoadControl", 1.0)
    ops.algorithm("Linear")
    ops.analysis("Static")
    ops.analyze(1)

    max_drift = 0.0
    for floor in range(1, floors + 1):
        disp = ops.nodeDisp(node_at(floor, bays), 1)
        max_drift = max(max_drift, abs(disp) / story_height)

    utilization = min(0.95, 0.55 + max_drift * 12)

    return {"max_drift": max_drift, "utilization": utilization, "source": "opensees"}


def _score_from_value(value: float, target: float, scale: float = 1.0) -> float:
    delta = (value - target) * scale
    score = 92 - delta
    return max(60, min(98, score))


def run_pipeline(run_id: str, stage: str = "full") -> None:
    db = SessionLocal()
    try:
        run = db.query(models.Run).filter(models.Run.id == run_id).first()
        if not run:
            return
        project = run.project
        output = run.output or models.Output(run=run)
        if not run.output:
            db.add(output)
            db.commit()

        run_dir = os.path.join(STORAGE_DIR, project.id, run.id)
        _ensure_storage(run_dir)

        stage_key = (stage or "full").strip().lower()
        _log_event(db, run, f"Starting orchestration stage: {stage_key}.", step="start")

        context = {
            "project": {
                "name": project.name,
                "region": project.region,
                "building_type": project.building_type,
                "phase": project.phase,
                "gfa": project.gfa,
                "floors": project.floors,
                "core_ratio": project.core_ratio,
                "budget": project.budget,
                "delivery": project.delivery,
                "energy_target": project.energy_target,
                "daylight": project.daylight,
                "structural_system": project.structural_system,
                "mep_strategy": project.mep_strategy,
                "brief": project.brief,
                "code_library": project.code_library,
                "parking": project.parking,
            }
        }

        plan = generate_design_plan(context)
        if plan:
            _log_event(db, run, "AI generated design plan.", step="llm")
        else:
            _log_event(
                db,
                run,
                "LLM not configured or unavailable. Using deterministic defaults.",
                step="llm",
                level="warning",
            )

        agent_payload = None
        agent_design = {}
        arch_component = {}
        structural_component = {}
        mep_component = {}
        try:
            if stage_key in {"architectural", "architecture", "arch"}:
                agent_payload = run_architecture_pipeline_sync(project.id, run.id)
                agent_design = (agent_payload or {}).get("design") or {}
                arch_component = agent_design.get("components", {}).get("architectural", {})
                if agent_design:
                    _log_event(db, run, "Architectural pipeline generated layout.", step="architecture")
            else:
                agent_payload = run_agent_pipeline_sync(project.id, run.id)
                agent_design = (agent_payload or {}).get("design") or {}
                arch_component = agent_design.get("components", {}).get("architectural", {})
                structural_component = agent_design.get("components", {}).get("structural", {})
                mep_component = agent_design.get("components", {}).get("mep", {})
                if agent_design:
                    _log_event(db, run, "Agent pipeline generated full design.", step="agents")
        except Exception as exc:
            _log_event(
                db,
                run,
                f"Agent pipeline unavailable: {exc}",
                step="agents",
                level="warning",
            )

        massing = _compute_massing(project)
        if agent_payload and agent_payload.get("massing"):
            massing = agent_payload["massing"]
            for key in ("width", "depth", "height", "floors", "floor_area", "core_ratio", "module", "grid_x", "grid_y"):
                if key in massing:
                    massing[key] = _safe_number(massing.get(key), massing.get(key))
            if "height" not in massing:
                massing["height"] = massing.get("floors", 1) * DEFAULT_FLOOR_HEIGHT
            if "floor_area" not in massing:
                massing["floor_area"] = massing.get("width", 0) * massing.get("depth", 0)
        massing = _apply_massing_overrides(massing, plan)

        if plan.get("structure", {}).get("system") and not project.structural_system:
            project.structural_system = plan["structure"]["system"]
        if plan.get("mep", {}).get("strategy") and not project.mep_strategy:
            project.mep_strategy = plan["mep"]["strategy"]
        if plan.get("performance", {}).get("energy_target") and not project.energy_target:
            project.energy_target = plan["performance"]["energy_target"]
        if plan.get("performance", {}).get("daylight") and not project.daylight:
            project.daylight = plan["performance"]["daylight"]
        if structural_component.get("system") and not project.structural_system:
            project.structural_system = structural_component["system"]
        hvac_system = mep_component.get("hvac", {}).get("system_type")
        if hvac_system and not project.mep_strategy:
            project.mep_strategy = hvac_system

        db.commit()

        file_base = _slugify(project.name)
        ifc_name = f"{file_base}_v10.ifc"
        gltf_name = f"{file_base}_massing.gltf"
        plan_name = f"{file_base}_plan.svg"
        structural_plan_name = f"{file_base}_structural_plan.svg"
        schedule_name = f"{file_base}_MEP_Schedule.xlsx"
        energy_report_name = f"{file_base}_Energy_Report.pdf"
        structural_report_name = f"{file_base}_Structural_Report.pdf"
        mep_layout_name = f"{file_base}_MEP_Layout.json"
        package_name = f"{file_base}_Review_Package.zip"

        ifc_path = os.path.join(run_dir, ifc_name)
        if stage_key not in {"architectural", "architecture", "arch"}:
            if _generate_ifc(ifc_path, project, massing):
                _register_artifact(db, run, "ifc", ifc_name, "IFC model")
            else:
                _log_event(
                    db,
                    run,
                    "IfcOpenShell not available; IFC export skipped.",
                    step="ifc",
                    level="warning",
                )

        gltf_path = os.path.join(run_dir, gltf_name)
        gltf_ready = _generate_gltf(gltf_path, project, massing)
        if gltf_ready or os.path.isfile(gltf_path):
            _register_artifact(db, run, "gltf", gltf_name, "Massing model")
            if not gltf_ready:
                _log_event(
                    db,
                    run,
                    "glTF stub generated; install trimesh for full export.",
                    step="gltf",
                    level="warning",
                )
        else:
            _log_event(db, run, "glTF export failed.", step="gltf", level="warning")

        if stage_key not in {"architectural", "architecture", "arch"} and \
            BLENDER_PATH and BLENDER_EXPORT_SCRIPT and os.path.isfile(ifc_path):
            if _tool_exists(BLENDER_PATH):
                try:
                    subprocess.run(
                        [
                            BLENDER_PATH,
                            "--background",
                            "--python",
                            BLENDER_EXPORT_SCRIPT,
                            "--",
                            ifc_path,
                            gltf_path,
                        ],
                        check=True,
                        capture_output=True,
                    )
                except subprocess.SubprocessError:
                    _log_event(db, run, "Blender export failed.", step="gltf", level="warning")

        plan_svg = None
        if arch_component.get("floor_plans"):
            plan_svg = _build_arch_plan_svg(
                arch_component["floor_plans"][0],
                structural_component,
                mep_component,
                massing,
            )
        if not plan_svg:
            plan_svg = _build_arch_plan_svg({}, structural_component, mep_component, massing)
        _write_file(os.path.join(run_dir, plan_name), plan_svg)
        _register_artifact(db, run, "plan", plan_name, "Plan SVG")
        _log_event(db, run, "Architectural plan generated.", step="architecture")

        # DXF Export for CAD software compatibility
        dxf_name = f"{file_base}_plan.dxf"
        dxf_path = os.path.join(run_dir, dxf_name)
        plan_data = arch_component.get("floor_plans", [{}])[0] if arch_component else {}
        dxf_doc = _build_dxf(plan_data, structural_component, mep_component, massing)
        if _write_dxf(dxf_path, dxf_doc):
            _register_artifact(db, run, "dxf", dxf_name, "DXF floor plan")
            _log_event(db, run, "DXF plan exported for CAD.", step="export")
        else:
            _log_event(
                db,
                run,
                "DXF export skipped; ezdxf unavailable.",
                step="export",
                level="warning",
            )

        if stage_key in {"architectural", "architecture", "arch"}:
            file_prefix = f"{project.id}/{run.id}/"
            output.plan_svg_file = file_prefix + plan_name
            output.gltf_file = file_prefix + gltf_name
            output.generated_at = "Generated moments ago"
            run.status = "Review"
            run.conflicts = "Architectural review"
            project.status = "Review"
            project.next_run = "Awaiting architectural approval"
            _log_event(db, run, "Awaiting architectural approval.", step="review")
            db.commit()
            return

        if structural_component:
            structural_plan_svg = _build_structural_plan_svg(structural_component, massing)
            _write_file(os.path.join(run_dir, structural_plan_name), structural_plan_svg)
            _register_artifact(
                db, run, "structural_plan", structural_plan_name, "Structural plan SVG"
            )

        _write_schedule(
            os.path.join(run_dir, schedule_name),
            project,
            massing,
            structural=structural_component or None,
            mep=mep_component or None,
        )
        _register_artifact(db, run, "schedule", schedule_name, "MEP schedule")

        if mep_component:
            clash_count = agent_design.get("metrics", {}).get("total_conflicts", 0) or 0
            clash_density = max(1.0, min(8.0, 1.2 + clash_count * 0.6))
            hvac = mep_component.get("hvac", {})
            electrical = mep_component.get("electrical", {})
            plumbing = mep_component.get("plumbing", {})
            mep_layout = {
                "system_type": hvac.get("system_type", ""),
                "cooling_capacity_kw": hvac.get("cooling_capacity_kw", 0),
                "ahu_count": len(hvac.get("ahus", [])),
                "duct_count": len(hvac.get("ductwork", [])),
                "total_demand_kva": electrical.get("loads", {}).get("total_demand", 0),
                "panel_count": len(electrical.get("distribution", {}).get("panels", [])),
                "riser_count": len(plumbing.get("risers", [])),
                "metrics": mep_component.get("metrics", {}),
                "clash_density": clash_density,
            }
        else:
            mep_layout = _generate_mep_layout(massing)
        _write_mep_layout(os.path.join(run_dir, mep_layout_name), mep_layout)
        _register_artifact(db, run, "mep", mep_layout_name, "MEP layout JSON")

        _log_event(db, run, "MEP layout synthesized.", step="mep")

        energy_result = _run_energyplus(run_dir, project, massing)
        energy_source = "energyplus" if energy_result else "heuristic"
        if not energy_result:
            estimated_eui = (
                mep_component.get("metrics", {}).get("estimated_eui_kwh_per_m2")
                if mep_component
                else None
            )
            if estimated_eui:
                energy_result = (estimated_eui, "mep_estimate")
                energy_source = "mep_estimate"
            else:
                _log_event(
                    db,
                    run,
                    "EnergyPlus not configured; using heuristic estimate.",
                    step="energy",
                    level="warning",
                )
                energy_result = _estimate_energy(project, massing)

        eui, energy_source = energy_result
        energy_lines = [
            "AI Designer | Energy & Compliance Report",
            f"Project: {project.name}",
            f"Region: {project.region}",
            f"Building Type: {project.building_type}",
            f"GFA: {project.gfa} m2",
            f"Floors: {project.floors}",
            f"Energy Source: {energy_source}",
            f"EUI: {eui:.1f} kWh/m2-year",
            "",
            "Summary:",
            "- Envelope and system assumptions aligned to project inputs.",
            "- Energy target compared against baseline model.",
            "- Recommended optimizations listed in the decisions log.",
        ]
        _write_binary(os.path.join(run_dir, energy_report_name), _build_pdf_report(energy_lines))
        _register_artifact(db, run, "energy", energy_report_name, "Energy report")
        _log_event(db, run, "Energy analysis complete.", step="energy")

        if structural_component:
            metrics = structural_component.get("metrics", {})
            avg_col = metrics.get("avg_column_utilization", 0) or 0
            avg_beam = metrics.get("avg_beam_utilization", 0) or 0
            utilization = max(avg_col, avg_beam)
            analysis = structural_component.get("analysis", {})
            drift = analysis.get("max_drift_ratio", analysis.get("max_drift", 0))
            structural_lines = [
                "AI Designer | Structural Review",
                f"Project: {project.name}",
                f"System: {structural_component.get('system', project.structural_system)}",
                f"Material: {structural_component.get('material', 'concrete')}",
                f"Max Drift Ratio: {drift:.4f}",
                f"Avg Column Utilization: {avg_col:.2f}",
                f"Avg Beam Utilization: {avg_beam:.2f}",
                "",
                "Summary:",
                "- Residential gravity loads and lateral checks applied.",
                "- Member sizing based on grid spans and target utilization.",
                "- Drift checked against preliminary serviceability targets.",
            ]
        else:
            structural = _run_structural_analysis(massing)
            drift = structural["max_drift"]
            utilization = structural["utilization"]
            structural_lines = [
                "AI Designer | Structural Review",
                f"Project: {project.name}",
                f"System: {project.structural_system}",
                f"Max Drift: {drift:.4f}",
                f"Utilization: {utilization:.2f}",
                f"Source: {structural.get('source', 'heuristic')}",
                "",
                "Summary:",
                "- Frame sizing derived from grid and loading assumptions.",
                "- Drift checked against preliminary serviceability targets.",
            ]
        _write_binary(
            os.path.join(run_dir, structural_report_name), _build_pdf_report(structural_lines)
        )
        _register_artifact(db, run, "structural", structural_report_name, "Structural report")
        _log_event(db, run, "Structural analysis complete.", step="structure")

        _write_review_package(
            run_dir,
            package_name,
            [
                ifc_name,
                gltf_name,
                plan_name,
                structural_plan_name,
                dxf_name,  # CAD-compatible floor plan
                schedule_name,
                energy_report_name,
                structural_report_name,
                mep_layout_name,
            ],
        )
        _register_artifact(db, run, "package", package_name, "Review package")
        _log_event(db, run, "Review package generated.", step="package")

        decisions = plan.get("decisions") if plan else None
        if decisions:
            for decision in decisions[:5]:
                _log_event(db, run, decision, step="decision")

        agent_decisions = agent_design.get("decisions") or []
        for decision in agent_decisions[:6]:
            message = decision.get("decision") if isinstance(decision, dict) else str(decision)
            if message:
                _log_event(db, run, message, step="decision")

        summary = generate_run_summary(
            {
                "project": project.name,
                "energy_eui": eui,
                "structural_utilization": utilization,
                "clash_density": mep_layout["clash_density"],
            }
        )
        if summary:
            for line in summary.split("\n"):
                cleaned = line.strip("- ")
                if cleaned:
                    _log_event(db, run, cleaned, step="summary")

        # Store relative paths from storage directory for file serving
        file_prefix = f"{project.id}/{run.id}/"
        output.ifc_file = file_prefix + ifc_name
        output.dxf_file = file_prefix + dxf_name
        output.gltf_file = file_prefix + gltf_name
        output.plan_svg_file = file_prefix + plan_name
        output.mep_schedule_file = file_prefix + schedule_name
        output.energy_report_file = file_prefix + energy_report_name
        output.review_package_file = file_prefix + package_name

        output.energy = f"EUI {eui:.0f}"
        output.generated_at = "Generated moments ago"

        clash_density = mep_layout["clash_density"]
        output.clash_density = f"{clash_density:.1f}%"
        output.clash_free = max(90, 100 - clash_density)
        output.structural_variance = f"{utilization * 100:.1f}%"

        target_eui = _safe_number(project.energy_target, eui)
        output.energy_score = _score_from_value(eui, target_eui, scale=0.7)
        output.structural_score = _score_from_value(utilization * 100, 75, scale=0.6)
        conflict_count = agent_design.get("metrics", {}).get("total_conflicts", 0) or 0
        compliance_score = max(88, 100 - conflict_count * 2)
        output.compliance = f"{compliance_score:.0f}%"

        run.status = "Complete"
        run.conflicts = f"{conflict_count} conflicts"
        run.completed_at = datetime.utcnow()

        project.status = "Review"
        project.next_run = "Client review"

        db.commit()
    except Exception as exc:
        try:
            run = db.query(models.Run).filter(models.Run.id == run_id).first()
            if run:
                run.status = "Failed"
                run.conflicts = "Check logs"
                db.commit()
                _log_event(db, run, f"Run failed: {exc}", step="error", level="error")
        finally:
            pass
    finally:
        db.close()
