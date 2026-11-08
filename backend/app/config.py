from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = 'postgresql+psycopg://tambopay:tambopay@localhost:5432/tambopay'
    environment: str = 'development'
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')


settings = Settings()
