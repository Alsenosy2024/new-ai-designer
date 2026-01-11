import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
STORAGE_DIR = os.getenv("STORAGE_DIR", os.path.join(BASE_DIR, "storage"))

DEFAULT_FLOOR_HEIGHT = float(os.getenv("DEFAULT_FLOOR_HEIGHT", "3.3"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_AUTH_MODE = os.getenv("GEMINI_AUTH_MODE", "auto")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
GEMINI_BASE_URL = os.getenv(
    "GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta"
)
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "1024"))
LLM_TIMEOUT = float(os.getenv("LLM_TIMEOUT", "40"))

ENERGYPLUS_PATH = os.getenv("ENERGYPLUS_PATH", "energyplus")
ENERGYPLUS_WEATHER = os.getenv("ENERGYPLUS_WEATHER", "")
ENERGYPLUS_IDD = os.getenv("ENERGYPLUS_IDD", "")

BLENDER_PATH = os.getenv("BLENDER_PATH", "")
BLENDER_EXPORT_SCRIPT = os.getenv("BLENDER_EXPORT_SCRIPT", "")
