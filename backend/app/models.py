import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


def generate_id():
    return str(uuid.uuid4())


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_id)
    name = Column(String, nullable=False)
    region = Column(String, default="")
    building_type = Column(String, default="")
    phase = Column(String, default="")
    gfa = Column(String, default="")
    floors = Column(String, default="")
    status = Column(String, default="Queued")
    next_run = Column(String, default="Awaiting launch")
    brief = Column(Text, default="")
    core_ratio = Column(String, default="")
    parking = Column(String, default="")
    budget = Column(String, default="")
    delivery = Column(String, default="")
    code_library = Column(String, default="")
    energy_target = Column(String, default="")
    daylight = Column(String, default="")
    structural_system = Column(String, default="")
    mep_strategy = Column(String, default="")
    site_model = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    runs = relationship("Run", back_populates="project", cascade="all, delete-orphan")


class Run(Base):
    __tablename__ = "runs"

    id = Column(String, primary_key=True, default=generate_id)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    status = Column(String, default="Queued")
    conflicts = Column(String, default="0 conflicts")
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", back_populates="runs")
    output = relationship(
        "Output", back_populates="run", uselist=False, cascade="all, delete-orphan"
    )
    events = relationship(
        "RunEvent", back_populates="run", cascade="all, delete-orphan"
    )
    artifacts = relationship(
        "Artifact", back_populates="run", cascade="all, delete-orphan"
    )


class Output(Base):
    __tablename__ = "outputs"

    id = Column(String, primary_key=True, default=generate_id)
    run_id = Column(String, ForeignKey("runs.id"), nullable=False)
    clash_density = Column(String, default="")
    structural_variance = Column(String, default="")
    compliance = Column(String, default="")
    energy = Column(String, default="")
    clash_free = Column(Float, default=0)
    energy_score = Column(Float, default=0)
    structural_score = Column(Float, default=0)
    ifc_file = Column(String, default="")
    mep_schedule_file = Column(String, default="")
    energy_report_file = Column(String, default="")
    review_package_file = Column(String, default="")
    plan_svg_file = Column(String, default="")
    gltf_file = Column(String, default="")
    generated_at = Column(String, default="")

    run = relationship("Run", back_populates="output")


class RunEvent(Base):
    __tablename__ = "run_events"

    id = Column(String, primary_key=True, default=generate_id)
    run_id = Column(String, ForeignKey("runs.id"), nullable=False)
    message = Column(Text, default="")
    level = Column(String, default="info")
    step = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())

    run = relationship("Run", back_populates="events")


class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(String, primary_key=True, default=generate_id)
    run_id = Column(String, ForeignKey("runs.id"), nullable=False)
    kind = Column(String, default="")
    file_name = Column(String, default="")
    description = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())

    run = relationship("Run", back_populates="artifacts")
