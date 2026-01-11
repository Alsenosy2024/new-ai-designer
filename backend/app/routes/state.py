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
        raise HTTPException(status_code=404, detail="No project found")
    return schemas.StateResponse(project=project, run=run, outputs=output)


@router.post("/state", response_model=schemas.StateResponse)
def write_state(payload: schemas.StatePayload, db: Session = Depends(get_db)):
    project, run, output = apply_state_payload(db, payload)
    return schemas.StateResponse(project=project, run=run, outputs=output)


@router.post("/runs/start", response_model=schemas.StateResponse)
def run_orchestrator(
    background_tasks: BackgroundTasks,
    project_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    try:
        project, run, output = start_run(db, project_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    background_tasks.add_task(run_pipeline, run.id)
    return schemas.StateResponse(project=project, run=run, outputs=output)


@router.get("/runs/{run_id}/events", response_model=list[schemas.RunEventResponse])
def read_run_events(run_id: str, db: Session = Depends(get_db)):
    events = (
        db.query(models.RunEvent)
        .filter(models.RunEvent.run_id == run_id)
        .order_by(models.RunEvent.created_at.asc())
        .all()
    )
    return events


@router.get("/runs/{run_id}/artifacts", response_model=list[schemas.ArtifactResponse])
def read_run_artifacts(run_id: str, db: Session = Depends(get_db)):
    artifacts = (
        db.query(models.Artifact)
        .filter(models.Artifact.run_id == run_id)
        .order_by(models.Artifact.created_at.asc())
        .all()
    )
    return artifacts
