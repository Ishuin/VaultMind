from typing import List, Union, Optional
from pydantic import validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ThoughtWeb Navigator"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str) and v.startswith("["):
            import json
            return json.loads(v)
        return v

    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/second_brain"
    LANCEDB_URI: str = "./.lancedb"
    
    # LLM Settings
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "llama3.2:1b"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENROUTER_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_BASE_URL: str = "https://api.anthropic.com/v1"
    ANTHROPIC_VERSION: str = "2023-06-01"
    ANTHROPIC_MODEL: str = "claude-sonnet-4-5"
    ANTHROPIC_FALLBACK_MODELS: List[str] = ["claude-sonnet-4-5", "claude-opus-4-1", "claude-haiku-4-5"]
    NVIDIA_NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_API_KEY: Optional[str] = None

    # BYOK key encryption (Fernet). Falls back to a key derived from SECRET_KEY.
    LLM_KEYS_FERNET_KEY: Optional[str] = None
    
    # Razorpay Settings
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None
    
    # Email Settings (SendGrid)
    SENDGRID_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "noreply@vaultmind.app"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Upload Limits
    MAX_UPLOAD_SIZE_MB: int = 50  # Per-file limit in MB
    MAX_USER_STORAGE_MB: int = 5000  # Per-user total storage limit in MB (5GB)

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
