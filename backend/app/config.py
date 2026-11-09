from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = 'postgresql+psycopg://tambopay:tambopay@localhost:5432/tambopay'
    environment: str = 'development'
    ai_api_key: str | None = None
    ai_model: str = 'gpt-4.1-mini'
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')


settings = Settings()
