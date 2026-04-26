from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://bookflow:bookflow123@pricing-db:5432/pricing_db"
    EBAY_APP_ID: str = ""
    EBAY_BASE_URL: str = "https://api.ebay.com/buy/browse/v1"
    CATALOG_SERVICE_URL: str = "http://catalog-service:8001"
    INVENTORY_SERVICE_URL: str = "http://inventory-service:8002"
    SERVICE_PORT: int = 8005

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
