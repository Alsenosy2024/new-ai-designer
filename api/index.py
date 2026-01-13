"""
Vercel Serverless Function Entry Point
======================================
Wraps the FastAPI application for Vercel deployment.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
import json

# Create FastAPI app
app = FastAPI(
    title="AI Architect Designer API",
    description="Multi-agent AI architectural design system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (for demo - use database in production)
storage = {
    "project": None,
    "run": None,
    "outputs": None
}


# Pydantic models
class ProjectPayload(BaseModel):
    id: Optional[str] = None
    name: str
    region: Optional[str] = ""
    type: Optional[str] = ""
    phase: Optional[str] = ""
    gfa: Optional[str] = ""
    floors: Optional[str] = ""
    status: Optional[str] = ""
    brief: Optional[str] = ""
    core_ratio: Optional[str] = ""
    parking: Optional[str] = ""
    budget: Optional[str] = ""
    structural_system: Optional[str] = ""
    mep_strategy: Optional[str] = ""


class RunPayload(BaseModel):
    id: Optional[str] = None
    status: Optional[str] = ""
    conflicts: Optional[str] = ""


class OutputPayload(BaseModel):
    id: Optional[str] = None
    clash_density: Optional[str] = ""
    structural_variance: Optional[str] = ""
    compliance: Optional[str] = ""
    energy: Optional[str] = ""
    clash_free: Optional[float] = 0
    energy_score: Optional[float] = 0
    structural_score: Optional[float] = 0


class StatePayload(BaseModel):
    project: ProjectPayload
    run: Optional[RunPayload] = None
    outputs: Optional[OutputPayload] = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    region: str
    building_type: str
    phase: str
    gfa: str
    floors: str
    status: str
    brief: str
    core_ratio: str
    parking: str
    budget: str
    structural_system: str
    mep_strategy: str


class RunResponse(BaseModel):
    id: str
    status: str
    conflicts: str
    updated_at: Optional[datetime] = None


class OutputResponse(BaseModel):
    id: str
    clash_density: str
    structural_variance: str
    compliance: str
    energy: str
    clash_free: float
    energy_score: float
    structural_score: float
    ifc_file: str
    mep_schedule_file: str
    energy_report_file: str
    plan_svg_file: str
    gltf_file: str
    generated_at: str


class StateResponse(BaseModel):
    project: ProjectResponse
    run: Optional[RunResponse] = None
    outputs: Optional[OutputResponse] = None


# API Routes
@app.get("/")
async def root():
    return {"message": "AI Architect Designer API", "version": "1.0.0"}


@app.get("/api/state")
async def read_state():
    if storage["project"] is None:
        raise HTTPException(status_code=404, detail="No project found")

    response = {"project": storage["project"]}
    if storage["run"]:
        response["run"] = storage["run"]
    if storage["outputs"]:
        response["outputs"] = storage["outputs"]

    return response


@app.post("/api/state")
async def write_state(payload: StatePayload):
    # Create or update project
    project_id = payload.project.id or str(uuid.uuid4())

    storage["project"] = {
        "id": project_id,
        "name": payload.project.name,
        "region": payload.project.region or "",
        "building_type": payload.project.type or "office",
        "phase": payload.project.phase or "",
        "gfa": payload.project.gfa or "",
        "floors": payload.project.floors or "",
        "status": payload.project.status or "active",
        "brief": payload.project.brief or "",
        "core_ratio": payload.project.core_ratio or "",
        "parking": payload.project.parking or "",
        "budget": payload.project.budget or "",
        "structural_system": payload.project.structural_system or "",
        "mep_strategy": payload.project.mep_strategy or ""
    }

    return {"project": storage["project"], "run": storage["run"], "outputs": storage["outputs"]}


@app.post("/api/runs/start")
async def run_orchestrator(project_id: Optional[str] = None):
    if storage["project"] is None:
        raise HTTPException(status_code=404, detail="No project found")

    # Create run
    run_id = str(uuid.uuid4())
    storage["run"] = {
        "id": run_id,
        "status": "Complete",
        "conflicts": "0 conflicts",
        "updated_at": datetime.utcnow().isoformat()
    }

    # Update project status
    storage["project"]["status"] = "Review"
    storage["project"]["next_run"] = "Client review"

    # Generate outputs (simulated real results)
    import random
    project_name = storage["project"]["name"].replace(" ", "")

    storage["outputs"] = {
        "id": str(uuid.uuid4()),
        "clash_density": f"{random.uniform(1, 5):.1f}%",
        "structural_variance": f"{random.uniform(70, 85):.1f}%",
        "compliance": f"{random.randint(92, 98)}%",
        "energy": f"EUI {random.randint(95, 115)}",
        "clash_free": round(random.uniform(95, 99), 1),
        "energy_score": round(random.uniform(88, 95), 1),
        "structural_score": round(random.uniform(87, 94), 1),
        "ifc_file": f"{project_name}_v10.ifc",
        "mep_schedule_file": f"{project_name}_MEP_Schedule.xlsx",
        "energy_report_file": f"{project_name}_Energy_Report.pdf",
        "plan_svg_file": f"{project_name}_plan.svg",
        "gltf_file": f"{project_name}_massing.gltf",
        "generated_at": "Generated moments ago"
    }

    return {"project": storage["project"], "run": storage["run"], "outputs": storage["outputs"]}


@app.get("/api/runs/{run_id}/events")
async def read_run_events(run_id: str):
    # Return simulated events
    events = [
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "Starting architectural analysis", "level": "info", "step": "architecture"},
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "Floor plans generated", "level": "success", "step": "architecture"},
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "Starting structural analysis", "level": "info", "step": "structural"},
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "Structural system selected: moment_frame", "level": "success", "step": "structural"},
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "Starting MEP design", "level": "info", "step": "mep"},
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "HVAC system designed", "level": "success", "step": "mep"},
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "Resolving conflicts", "level": "info", "step": "coordination"},
        {"id": str(uuid.uuid4()), "run_id": run_id, "message": "Design complete", "level": "success", "step": "finalization"},
    ]
    return events


@app.get("/api/agents/status")
async def get_agents_status():
    return {
        "agents": [
            {"name": "architectural", "status": "ready", "domain": "architecture"},
            {"name": "structural", "status": "ready", "domain": "structure"},
            {"name": "mep", "status": "ready", "domain": "mep"},
            {"name": "interior", "status": "ready", "domain": "interior"}
        ]
    }


# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# Export for Vercel
handler = app
