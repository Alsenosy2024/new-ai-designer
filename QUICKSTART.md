# AI Designer - Quick Start Guide

Get the multi-agent AI designer running in 5 minutes.

---

## Prerequisites

- Python 3.10+ (currently using 3.13.0)
- API Keys (at least one):
  - Gemini API Key (recommended) OR
  - OpenAI API Key

---

## Setup

### 1. Activate Virtual Environment

```bash
cd "new new ai designer/new-ai-designer"
source .venv/bin/activate
```

### 2. Verify Installation

All dependencies are already installed! Verify with:

```bash
cd backend
python -c "import fastapi, shapely, anthropic; print('✓ All dependencies ready')"
```

### 3. Configure API Keys

The `.env` file is already configured with:
- ✅ OpenAI API Key
- ✅ Gemini API Key

Located at: `backend/.env`

---

## Usage

### Option 1: Run Test Suite (Recommended First)

```bash
cd backend
source ../.venv/bin/activate
python test_agents.py
```

**Expected Output:**
```
✓ PASS: Architectural Agent
✓ PASS: Structural Agent
✓ PASS: Full Coordination

Total: 3/3 tests passed
```

This will generate a test result JSON file with design metrics.

---

### Option 2: Start API Server

```bash
cd backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

**Server will start at:** `http://localhost:8001`

**API Endpoints:**

- `GET /` - Frontend (if index.html exists)
- `GET /api/state` - Get project state
- `POST /api/state` - Create/update project
- `POST /api/runs` - Start design run
- `GET /files/{filename}` - Download outputs

---

### Option 3: Use Python API Directly

```python
import asyncio
from app.agents import (
    AgentCoordinator,
    ArchitecturalAgent,
    StructuralAgent,
    MEPAgent,
    InteriorAgent,
)
from app.agent_orchestrator import LLMClient

async def generate_design():
    # Define project
    context = {
        "name": "My Office Building",
        "region": "saudi",
        "building_type": "office",
        "gfa": 10000,
        "floors": 10,
        "core_ratio": 0.12,
    }

    # Create coordinator
    llm = LLMClient()
    coordinator = AgentCoordinator(
        project_context=context,
        config={"max_iterations": 3}
    )

    # Register agents
    coordinator.register_agent(ArchitecturalAgent(llm, context))
    coordinator.register_agent(StructuralAgent(llm, context))
    coordinator.register_agent(MEPAgent(llm, context))
    coordinator.register_agent(InteriorAgent(llm, context))

    # Run coordination
    result = await coordinator.run()

    if result.success:
        print(f"✓ Design generated successfully!")
        print(f"  Iterations: {result.iterations}")
        print(f"  Conflicts resolved: {len(result.resolved_conflicts)}")
        return result.final_design
    else:
        print(f"✗ Design failed at phase: {result.phase.value}")
        return None

# Run it
design = asyncio.run(generate_design())
```

---

## What You Get

### Generated Files

After running a design, you'll find in `backend/storage/project_<id>/`:

1. **Design Data**
   - `run_<id>_design.json` - Complete design data
   - `run_<id>_architectural.json` - Floor plans, spaces
   - `run_<id>_structural.json` - Columns, beams, analysis
   - `run_<id>_mep.json` - HVAC, electrical, plumbing
   - `run_<id>_interior.json` - Furniture, lighting

2. **Decisions & Conflicts**
   - `run_<id>_decisions.json` - All agent decisions with reasoning
   - `run_<id>_conflicts.json` - Detected and resolved conflicts

3. **Exports** (from API)
   - Floor plan SVG
   - Structural plan SVG
   - DXF for AutoCAD
   - PDF reports
   - Excel schedules

---

## Example Project

### Office Building in Riyadh

```json
{
  "name": "Riyadh Office Tower",
  "region": "saudi",
  "building_type": "office",
  "gfa": 15000,
  "floors": 12,
  "core_ratio": 0.15,
  "structural_system": "moment_frame",
  "mep_strategy": "central",
  "budget": "standard"
}
```

**Expected Results:**
- ~1,250 m² per floor
- Moment frame structural system
- Central VAV HVAC system
- Open office + private office layouts
- Generation time: ~5-10 seconds

---

## Common Commands

### Run Tests
```bash
cd backend
python test_agents.py
```

### Start Server
```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

### Check Database
```bash
cd backend
sqlite3 app.db "SELECT * FROM projects;"
```

### View Logs
```bash
cd backend
tail -f server.log
```

---

## Troubleshooting

### Issue: Import errors

**Solution:**
```bash
cd backend
source ../.venv/bin/activate
pip install -r requirements.txt
```

### Issue: API key not found

**Solution:**
Check `backend/.env` has valid keys:
```bash
grep API_KEY backend/.env
```

### Issue: Server port already in use

**Solution:**
```bash
# Use different port
uvicorn app.main:app --reload --port 8002
```

---

## Architecture Overview

```
User Request
     ↓
AgentCoordinator
     ↓
┌────────────────────────────────────┐
│  Phase 1: Architectural Agent      │
│  - Space generation                │
│  - Floor plans                     │
│  - Code validation                 │
└────────────────┬───────────────────┘
                 ↓
     ┌───────────────────────┐
     │  Phase 2: Parallel    │
     ├───────────────────────┤
     │ Structural Agent      │
     │ MEP Agent             │
     └──────────┬────────────┘
                ↓
     ┌───────────────────────┐
     │  Phase 3: Resolution  │
     │  - Detect conflicts   │
     │  - Resolve issues     │
     │  - Iterate if needed  │
     └──────────┬────────────┘
                ↓
     ┌───────────────────────┐
     │  Phase 4: Interior    │
     │  - Furniture layout   │
     │  - Lighting design    │
     └──────────┬────────────┘
                ↓
     ┌───────────────────────┐
     │  Phase 5: Integration │
     │  - Merge designs      │
     │  - Generate outputs   │
     └───────────────────────┘
```

---

## Next Steps

1. ✅ **Run Tests** - Verify everything works
2. **Explore API** - Start server and test endpoints
3. **Create Projects** - Use the Python API
4. **Review Outputs** - Check generated files
5. **Customize** - Modify agents for your needs

---

## Resources

- **Full Documentation:** `ARCHITECTURE_DESIGN_PLAN.md`
- **Completion Report:** `PROJECT_COMPLETION_REPORT.md`
- **Backend README:** `backend/README.md`
- **Test Suite:** `backend/test_agents.py`

---

## Support

For issues or questions:

1. Check test results: `python test_agents.py`
2. Review logs: `backend/server.log`
3. Check database: `backend/app.db`
4. Refer to architecture plan

---

**Ready to design buildings with AI!** 🏗️✨
