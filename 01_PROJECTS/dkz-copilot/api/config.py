"""
DkZ CoPilot Backend — Konfiguration
Pydantic BaseSettings mit .env Unterstuetzung.
"""

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Zentrale Konfiguration fuer den DkZ CoPilot Backend."""

    # GitHub Authentifizierung
    GITHUB_TOKEN: str = Field(..., description="GitHub Personal Access Token")
    WEBHOOK_SECRET: str = Field(..., description="GitHub Webhook Secret fuer HMAC Verifikation")

    # vLLM / Qwen Konfiguration
    VLLM_URL: str = Field(
        default="http://localhost:8811/v1",
        description="vLLM OpenAI-kompatibler API Endpoint",
    )
    MODEL_NAME: str = Field(
        default="Qwen/Qwen3.5-7B",
        description="Modell-Name fuer vLLM Inference",
    )

    # Repository Konfiguration
    REPO_OWNER: str = Field(default="D-VKITZ", description="GitHub Organisation/Owner")
    DEFAULT_REPO: str = Field(default="KERN", description="Standard-Repository")
    WORK_DIR: str = Field(
        default="/tmp/dkz-repos",
        description="Arbeitsverzeichnis fuer geclonte Repos",
    )

    # Bot Konfiguration
    BOT_USERNAME: str = Field(default="dkz-bot", description="GitHub Bot Username")
    REVIEWER: str = Field(default="7IKED", description="Standard-Reviewer fuer PRs")
    PORT: int = Field(default=3050, description="Server Port")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton — einmal laden, ueberall nutzen
settings = Settings()
