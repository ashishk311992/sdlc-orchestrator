"""Application configuration loaded from environment variables."""
from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    env: str = "production"
    log_level: str = "INFO"
    api_port: int = 8080

    # LLM
    anthropic_api_key: str = ""
    llm_model: str = "claude-sonnet-4-5-20250929"
    llm_max_tokens: int = 8192

    # GitHub
    github_app_token: str = ""
    github_repo: str = ""
    github_default_branch: str = "main"
    github_webhook_secret: str = ""

    # Linear
    linear_api_key: str = ""
    linear_webhook_secret: str = ""
    linear_team_id: str = ""
    linear_trigger_label: str = "ai-ship"
    linear_in_review_state_id: str = ""
    linear_blocked_state_id: str = ""

    # Infra
    database_url: str = "postgresql+psycopg2://sdlc:sdlc@localhost:5432/sdlc"
    redis_url: str = "redis://localhost:6379/0"

    max_heal_attempts: int = 3
    stage_timeout_seconds: int = 900

    platform_callback_token: str = ""

    @field_validator("database_url")
    @classmethod
    def _normalize_db_url(cls, v: str) -> str:
        # Railway / Heroku style "postgres://..." -> SQLAlchemy needs driver
        if v.startswith("postgres://"):
            v = "postgresql+psycopg2://" + v[len("postgres://"):]
        elif v.startswith("postgresql://") and "+psycopg2" not in v:
            v = "postgresql+psycopg2://" + v[len("postgresql://"):]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
