"""
Configuration module for the FastAPI backend.
Loads environment variables from .env file.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    google_api_key: str
    gemini_model: str = "gemini-2.5-flash-lite"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
