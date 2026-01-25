import os

HERE = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(HERE)


def _load_env_file(path: str) -> None:
    if not os.path.isfile(path):
        return
    with open(path, "r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            if not key or key in os.environ:
                continue
            value = value.strip().strip("'").strip('"')
            os.environ[key] = value


def _load_env() -> None:
    for path in (
        os.path.join(BASE_DIR, ".env"),
        os.path.join(BASE_DIR, "..", ".env"),
    ):
        _load_env_file(os.path.abspath(path))


_load_env()

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
STORAGE_DIR = os.getenv("STORAGE_DIR", os.path.join(BASE_DIR, "storage"))

DEFAULT_FLOOR_HEIGHT = float(os.getenv("DEFAULT_FLOOR_HEIGHT", "3.3"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_AUTH_MODE = os.getenv("GEMINI_AUTH_MODE", "auto")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta")
GEMINI_DESIGN_API_KEY = os.getenv("GEMINI_DESIGN_API_KEY", "")
GEMINI_DESIGN_MCP_URL = os.getenv(
    "GEMINI_DESIGN_MCP_URL",
    "https://gemini-design-mcp-server-production.up.railway.app/mcp",
)
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "1024"))
LLM_TIMEOUT = float(os.getenv("LLM_TIMEOUT", "40"))

ENERGYPLUS_PATH = os.getenv("ENERGYPLUS_PATH", "energyplus")
ENERGYPLUS_WEATHER = os.getenv("ENERGYPLUS_WEATHER", "")
ENERGYPLUS_IDD = os.getenv("ENERGYPLUS_IDD", "")

BLENDER_PATH = os.getenv("BLENDER_PATH", "")
BLENDER_EXPORT_SCRIPT = os.getenv("BLENDER_EXPORT_SCRIPT", "")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)
