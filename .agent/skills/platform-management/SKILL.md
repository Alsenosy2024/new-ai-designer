---
name: Platform Management
description: Skills for managing the AI Designer platform backend, including starting, stopping, and status verification.
---

# Platform Management Skill

This skill provides instructions for managing the AI Designer backend infrastructure.

## Core Commands

### Start the Server
To start the FastAPI backend server with hot-reloading:
```bash
./start_server.sh
```
The server will be available at `http://localhost:8001`.

### Check Server Status
Use `curl` or a browser to check the server state:
```bash
curl -s http://localhost:8001/api/state
```

### Dashboard Access
- **Main Dashboard**: [app.html](http://localhost:8001/app.html)
- **Intake Form**: [intake.html](http://localhost:8001/intake.html)

## Troubleshooting
- **Port Conflict**: If port 8001 is in use, verify with `lsof -i :8001`.
- **Venv Issues**: The `start_server.sh` script automatically handles the activation of `.venv`.
