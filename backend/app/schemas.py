from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProjectPayload(BaseModel):
    id: Optional[str] = None
    name: str
    region: Optional[str] = ""
    type: Optional[str] = ""
    phase: Optional[str] = ""
    gfa: Optional[str] = ""
    floors: Optional[str] = ""
    status: Optional[str] = ""
    next_run: Optional[str] = ""
    brief: Optional[str] = ""
    core_ratio: Optional[str] = ""
    parking: Optional[str] = ""
    budget: Optional[str] = ""
    delivery: Optional[str] = ""
    code_library: Optional[str] = ""
    energy_target: Optional[str] = ""
    daylight: Optional[str] = ""
    structural_system: Optional[str] = ""
    mep_strategy: Optional[str] = ""
    site_model: Optional[str] = ""


class RunPayload(BaseModel):
    id: Optional[str] = None
    status: Optional[str] = ""
    conflicts: Optional[str] = ""
    updated_at: Optional[str] = ""


class OutputPayload(BaseModel):
    id: Optional[str] = None
    clash_density: Optional[str] = ""
    structural_variance: Optional[str] = ""
    compliance: Optional[str] = ""
    energy: Optional[str] = ""
    clash_free: Optional[float] = 0
    energy_score: Optional[float] = 0
    structural_score: Optional[float] = 0
    ifc_file: Optional[str] = ""
    mep_schedule_file: Optional[str] = ""
    energy_report_file: Optional[str] = ""
    review_package_file: Optional[str] = ""
    plan_svg_file: Optional[str] = ""
    gltf_file: Optional[str] = ""
    generated_at: Optional[str] = ""


class StatePayload(BaseModel):
    project: ProjectPayload
    run: Optional[RunPayload] = None
    outputs: Optional[OutputPayload] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    region: str
    building_type: str
    phase: str
    gfa: str
    floors: str
    status: str
    next_run: str
    brief: str
    core_ratio: str
    parking: str
    budget: str
    delivery: str
    code_library: str
    energy_target: str
    daylight: str
    structural_system: str
    mep_strategy: str
    site_model: str


class RunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    conflicts: str
    updated_at: Optional[datetime] = None


class OutputResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
    review_package_file: str
    plan_svg_file: str
    gltf_file: str
    generated_at: str


class RunEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    message: str
    level: str
    step: str
    created_at: Optional[datetime] = None


class ArtifactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    kind: str
    file_name: str
    description: str
    created_at: Optional[datetime] = None


class StateResponse(BaseModel):
    project: ProjectResponse
    run: Optional[RunResponse] = None
    outputs: Optional[OutputResponse] = None
