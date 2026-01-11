AI Designer Backend

Run locally

1) Create a virtualenv and install deps

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

2) Start API

uvicorn app.main:app --reload --port 8001

The API will be available at http://localhost:8001/api/state
Static frontend will be served at http://localhost:8001/ if index.html is present in the repo root.
Generated files are under backend/storage and are exposed at http://localhost:8001/files/.

Environment variables

DATABASE_URL: SQLAlchemy URL, default sqlite:///./app.db
CORS_ORIGINS: comma-separated list, default *
STORAGE_DIR: override storage directory
DEFAULT_FLOOR_HEIGHT: height per floor (meters)
GEMINI_API_KEY: Gemini API key for real orchestration
GEMINI_AUTH_MODE: api_key, oauth, or auto (default). auto uses api_key when GEMINI_API_KEY starts with AIza
GEMINI_MODEL: Gemini model name, default gemini-1.5-pro
GEMINI_BASE_URL: Gemini API base URL
LLM_TEMPERATURE: LLM temperature (0-1), default 0.2
LLM_MAX_TOKENS: max tokens, default 1024
LLM_TIMEOUT: request timeout seconds, default 40

ENERGYPLUS_PATH: path to energyplus binary (required for real energy simulation)
ENERGYPLUS_WEATHER: path to EPW weather file
ENERGYPLUS_IDD: path to Energy+.idd file
ENERGYPLUS_TEMPLATE: optional IDF template path (defaults to EnergyPlus Minimal.idf when available)

BLENDER_PATH: path to Blender binary (optional for IFC -> glTF conversion)
BLENDER_EXPORT_SCRIPT: path to backend/scripts/blender_export.py

Notes

- The schedule export uses openpyxl. If you want a lighter install, remove it and the schedule will fall back to CSV content with an .xlsx extension.
- For full BIM/energy/structural features, install IfcOpenShell, EnergyPlus, and OpenSeesPy per your OS setup, then set the environment variables above.
- For OAuth (Vertex AI) access tokens, set GEMINI_AUTH_MODE=oauth and GEMINI_BASE_URL to a Vertex endpoint like https://REGION-aiplatform.googleapis.com/v1/projects/PROJECT/locations/REGION/publishers/google.
