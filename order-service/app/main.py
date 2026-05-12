from __future__ import annotations
import logging

from fastapi import FastAPI
from sqlalchemy import text

from app.infrastructure.database.connection import Base, engine, SessionLocal

logger = logging.getLogger(__name__)
from app.infrastructure.database.models import OrderItemModel, OrderModel, CartModel, CartItemModel  # noqa: F401  registers tables
from app.routers.order_router import router as order_router
from app.routers.cart_router import router as cart_router

Base.metadata.create_all(bind=engine)

if engine.dialect.name == "postgresql":
    with engine.connect() as _conn:
        _conn.execute(text(
            "ALTER TABLE order_items ADD COLUMN IF NOT EXISTS book_reference VARCHAR(200)"
        ))
        _conn.commit()

app = FastAPI(
    title="BookFlow Order Service",
    version="0.1.0",
    description="Sprint 3 — pedido formal con state machine y validación de stock",
)

app.include_router(order_router, prefix="/orders", tags=["orders"])
app.include_router(cart_router, prefix="/cart", tags=["cart"])


@app.get("/health")
def health() -> dict:
    db_status = "disconnected"
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:
        logger.warning("Health check DB probe failed: %s", exc)
    finally:
        db.close()
    return {"status": "ok", "service": "order-service", "version": "0.1.0", "db": db_status}
