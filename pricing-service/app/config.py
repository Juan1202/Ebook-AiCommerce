from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://bookflow:bookflow123@pricing-db:5432/pricing_db"
    EBAY_API_URL: str = "https://api.ebay.com/buy/browse/v1/item_summary/search"
    EBAY_APP_ID: str = ""
    CACHE_TTL: int = 3600  # 1 hour
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 5
    CIRCUIT_BREAKER_RECOVERY_TIMEOUT: int = 60
    MIN_PRICE_THRESHOLD: float = 5.0
    CONDITION_FACTORS: dict = {
        "NUEVO": 1.0,
        "BUENO": 0.75,
        "ACEPTABLE": 0.50,
        "DETERIORADO": 0.25
    }

    class Config:
        env_file = ".env"


settings = Settings()
