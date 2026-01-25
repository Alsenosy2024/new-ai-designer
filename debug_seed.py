
import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db import SessionLocal, engine, Base
from app import models, services
from app.services import _build_arch_plan_svg, _write_file, _ensure_storage
from app.config import STORAGE_DIR

def _slugify(name: str) -> str:
    return "".join([char for char in name if char.isalnum()]) or "Project"

def seed_and_test():
    print("Initializing DB...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Create Project
    project = db.query(models.Project).first()
    if not project:
        print("Creating new project...")
        # Use only valid columns from models.py (Step 133)
        # defined: name, region, building_type, phase, gfa, floors, status, next_run...
        project = models.Project(
            name="Riyadh Office Tower",
            region="Saudi Arabia",
            building_type="Office",
            phase="Concept",
            floors="25",
            gfa="45000",
            status="Active"
        )
        db.add(project)
        db.commit()
        db.refresh(project)
    else:
        print(f"Using existing project: {project.id}")

    # 2. Create Run
    if project:
        print(f"Project ID: {project.id}")
        
    run = models.Run(project=project, status="Completed", conflicts="Resolved")
    db.add(run)
    db.commit()
    db.refresh(run)
    print(f"Created new Run: {run.id}")

    # 3. Create Output
    output = models.Output(run=run)
    db.add(output)
    
    # 4. Generate SVG
    print("Generating SVG...")
    file_base = _slugify(project.name)
    plan_name = f"{file_base}_plan.svg"
    
    # Mock data for generation
    massing = services._compute_massing(project)
    print(f"Computed massing: {massing}")
    
    # Generate SVG content
    svg_content = _build_arch_plan_svg({}, massing=massing)
    print(f"SVG Content Length: {len(svg_content)}")
    
    # 5. Save File
    run_dir = os.path.join(STORAGE_DIR, project.id, run.id)
    _ensure_storage(run_dir)
    file_path = os.path.join(run_dir, plan_name)
    
    _write_file(file_path, svg_content)
    print(f"Saved SVG to: {file_path}")
    
    # 6. Update Output record
    output.plan_svg_file = plan_name
    output.generated_at = "Just now"
    output.clash_free = 100.0
    output.energy_score = 95.0
    db.commit()
    
    # 7. Generate a Dummy GLTF (using basic cube if trimesh missing)
    gltf_name = f"{file_base}_massing.gltf"
    gltf_path = os.path.join(run_dir, gltf_name)
    
    try:
        import trimesh
        print("Trimesh found, generating box...")
        mesh = trimesh.creation.box(extents=(massing['width'], massing['height'], massing['depth']))
        mesh.export(gltf_path)
    except ImportError:
        print("Trimesh not found, writing manual GLTF stub...")
        # A minimal valid GLTF box
        stub_content = """
{
    "asset": {"version": "2.0"},
    "scenes": [{"nodes": [0]}],
    "nodes": [{"mesh": 0}],
    "meshes": [{"primitives": [{"attributes": {"POSITION": 0}, "indices": 1}]}],
    "buffers": [{"uri": "data:application/octet-stream;base64,AAABAAAAAQAAAAEAAAEAAQAAAAEAAAD/////AAAAAQAAAAAAAAABAAAAAQAAAAEAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAD/////AAAAAQAAAAAAAAABAAAAAQAAAAEAAAABAAAAAQAAAAAAAAAAAAAAAQAAAAAAAAABAAAAAQAAAAEAAAABAAAAAQAAAAAAAAAAAAAA", "byteLength": 100}],
    "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 100, "target": 34962}],
    "accessors": [{"bufferView": 0, "componentType": 5126, "count": 24, "type": "VEC3"}, {"bufferView": 0, "componentType": 5123, "count": 36, "type": "SCALAR"}]
}
"""     
        # Using a safer stub generator if possible, or just the text
        _write_file(gltf_path, stub_content) 
        
    output.gltf_file = gltf_name
    db.commit()
    
    print("Seed complete.")

if __name__ == "__main__":
    seed_and_test()
