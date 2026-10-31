import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
WORKSPACE_DIR = DATA_DIR / "workspaces"
SAMPLE_DIR = BASE_DIR / "app" / "sample_data"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "PAPERTRAIL — The Clarity Engine"
    TAGLINE: str = "Understand the requirements. Know what to do. Never submit blindly."
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Storage settings
    UPLOAD_DIR: Path = UPLOAD_DIR
    WORKSPACE_DIR: Path = WORKSPACE_DIR
    SAMPLE_DIR: Path = SAMPLE_DIR
    
    # Limits & Security
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg"}
    DATA_RETENTION_HOURS: int = 48
    
    # AI Providers
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma:2b")
    DEFAULT_PROVIDER: str = os.getenv("AI_PROVIDER", "deterministic")  # deterministic | gemini | ollama
    
    # Privacy consent
    REQUIRE_REMOTE_CONSENT: bool = True

settings = Settings()
