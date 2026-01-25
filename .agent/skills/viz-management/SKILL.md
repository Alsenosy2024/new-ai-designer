---
name: Visualization Management
description: Skills for managing and verifying the architectural outputs (2D/3D viewers).
---

# Visualization Management Skill

This skill covers the tools and files used to visualize the design results.

## Visualizers

### 2D/3D Viewer
- **File**: `outputs.html`
- **Controller**: `viewer.js`
- **Access**: `http://localhost:8001/outputs.html`

### Features
- **2D View**: Renders SVG floor plans (e.g., `Plan_View.svg`).
- **3D View**: Renders Three.js scenes from GLTF models.
- **Metrics**: Displays energy, structural, and compliance scores.

## Output Assets
Assets are stored by `project_id` and `run_id` under the `storage/` directory (mounted at `/files`).

- **Vector Plans**: `.svg`, `.dxf`
- **3D Models**: `.gltf`, `.ifc`
- **Reports**: `.pdf`, `.xlsx`

## Verification
1.  Check if `planContainer` is correctly initialized in `viewer.js`.
2.  Ensure paths to `/files/...` are constructed using the correct project and run IDs.
3.  Check browser console for GLTF loading or SVG parsing errors.
