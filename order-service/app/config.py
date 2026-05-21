import enum

from pydantic_settings import BaseSettings


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    SHIPPED = "shipped"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://bookflow:bookflow123@order-db:5432/order_db"
    CART_SERVICE_URL: str = "http://cart-service:8010"
    INVENTORY_SERVICE_URL: str = "http://inventory-service:8002"

    class Config:
        env_file = ".env"


settings = Settings()
