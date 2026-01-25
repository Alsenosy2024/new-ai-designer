---
name: Design Orchestration
description: Skills for managing the multi-agent architectural design pipeline.
---

# Design Orchestration Skill

This skill defines the process of coordinating multiple AI agents to generate a complete building design.

## Agent Workflow Order
1.  **Architectural Agent**: Massing, floor plans, and core layout.
2.  **Structural Agent**: Grid modules, column placement, and structural analysis.
3.  **MEP Agent**: HVAC strategy, electrical demand, and plumbing risers.
4.  **Interior Agent**: Furniture layouts, styles, and finish schedules.
5.  **Conflict Resolver / Coordinator**: Coordination and clash detection.

## Orchestration Methods

### API Trigger
To start a design run via the API:
```bash
curl -X POST http://localhost:8001/api/runs/start \
     -H "Content-Type: application/json" \
     -d '{"stage": "full"}'
```

### Script Execution
The orchestrator can many stages or specific ones:
- `app.orchestrator.run_pipeline`: Main entry point for the background task.
- `app.agent_orchestrator.AgentOrchestrator`: Class handling the sequencing.

## Project State
State is managed via `backend/app/routes/state.py`.
- **GET /api/state**: Get latest project/run status.
- **POST /api/state**: Apply new project data.
