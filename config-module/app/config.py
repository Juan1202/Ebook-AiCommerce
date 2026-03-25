from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://bookflow:bookflow123@config-db:5432/config_db"

    class Config:
        env_file = ".env"


settings = Settings()
