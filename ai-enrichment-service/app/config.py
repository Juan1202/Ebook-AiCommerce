from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://bookflow:bookflow123@enrichment-db:5432/enrichment_db"
    GOOGLE_BOOKS_API_KEY: str = ""
    OPEN_LIBRARY_BASE_URL: str = "https://openlibrary.org"
    CROSSREF_BASE_URL: str = "https://api.crossref.org"
    CATALOG_SERVICE_URL: str = "http://catalog-service:8003"
    SERVICE_PORT: int = 8004

    class Config:
        env_file = ".env"


settings = Settings()
