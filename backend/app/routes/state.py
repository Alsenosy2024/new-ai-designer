import json
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.db import get_db
from app import models
from app.orchestrator import run_pipeline
from app.services import apply_state_payload, get_latest_state, start_run

router = APIRouter(prefix="/api", tags=["state"])


@router.get("/state", response_model=schemas.StateResponse)
def read_state(db: Session = Depends(get_db)):
    project, run, output = get_latest_state(db)
    if not project:
        project = models.Project(
            name="New Project",
            status="Draft",
            next_run="Awaiting launch",
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return schemas.StateResponse(project=project, run=None, outputs=None)
    return schemas.StateResponse(project=project, run=run, outputs=output)


@router.post("/state", response_model=schemas.StateResponse)
def write_state(payload: schemas.StatePayload, db: Session = Depends(get_db)):
    project, run, output = apply_state_payload(db, payload)
    return schemas.StateResponse(project=project, run=run, outputs=output)


@router.post("/runs/start", response_model=schemas.StateResponse)
def run_orchestrator(
    background_tasks: BackgroundTasks,
    project_id: Optional[str] = None,
    stage: Optional[str] = None,
    db: Session = Depends(get_db),
):
    try:
        project, run, output = start_run(db, project_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    background_tasks.add_task(run_pipeline, run.id, stage or "full")
    return schemas.StateResponse(project=project, run=run, outputs=output)


@router.get("/projects/{project_id}/runs/latest")
def get_latest_run_for_project(project_id: str, db: Session = Depends(get_db)):
    """Get the most recent run for a specific project."""
    run = (
        db.query(models.Run)
        .filter(models.Run.project_id == project_id)
        .order_by(models.Run.id.desc())
        .first()
    )

    if not run:
        return {"run": None}

    return {
        "run": {
            "id": run.id,
            "project_id": run.project_id,
            "status": run.status,
            "conflicts": run.conflicts,
            "started_at": run.started_at,
            "completed_at": run.completed_at,
        }
    }


@router.get("/runs/{run_id}/events", response_model=list[schemas.RunEventResponse])
def read_run_events(run_id: str, db: Session = Depends(get_db)):
    events = (
        db.query(models.RunEvent)
        .filter(models.RunEvent.run_id == run_id)
        .order_by(models.RunEvent.created_at.asc())
        .all()
    )
    return events


@router.post("/runs/{run_id}/events", response_model=schemas.RunEventResponse)
def create_run_event(
    run_id: str, payload: schemas.RunEventCreate, db: Session = Depends(get_db)
):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    event = models.RunEvent(
        run=run, message=payload.message, step=payload.step, level=payload.level
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/runs/{run_id}/artifacts", response_model=list[schemas.ArtifactResponse])
def read_run_artifacts(run_id: str, db: Session = Depends(get_db)):
    artifacts = (
        db.query(models.Artifact)
        .filter(models.Artifact.run_id == run_id)
        .order_by(models.Artifact.created_at.asc())
        .all()
    )
    return artifacts


@router.get("/runs/{run_id}/plan", response_model=schemas.PlanRevisionResponse)
def read_plan_revision(run_id: str, db: Session = Depends(get_db)):
    plan = db.query(models.PlanRevision).filter(models.PlanRevision.run_id == run_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    try:
        payload = json.loads(plan.payload or "{}")
    except json.JSONDecodeError:
        payload = {}
    return schemas.PlanRevisionResponse(
        run_id=plan.run_id, payload=payload, updated_at=plan.updated_at
    )


@router.post("/runs/{run_id}/plan", response_model=schemas.PlanRevisionResponse)
def save_plan_revision(
    run_id: str, payload: schemas.PlanRevisionPayload, db: Session = Depends(get_db)
):
    run = db.query(models.Run).filter(models.Run.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    plan = db.query(models.PlanRevision).filter(models.PlanRevision.run_id == run_id).first()
    if not plan:
        plan = models.PlanRevision(run=run)
        db.add(plan)
    plan.payload = json.dumps(payload.payload or {}, ensure_ascii=True)
    db.commit()
    db.refresh(plan)
    return schemas.PlanRevisionResponse(
        run_id=plan.run_id, payload=payload.payload or {}, updated_at=plan.updated_at
    )
