from __future__ import annotations

from fastapi import FastAPI

from app.infrastructure.database.connection import Base, engine
from app.infrastructure.database.models import OrderItemModel, OrderModel  # noqa: F401  registers tables
from app.routers.order_router import router as order_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BookFlow Order Service",
    version="0.1.0",
    description="Sprint 3 — pedido formal con state machine y validación de stock",
)

app.include_router(order_router, prefix="/orders", tags=["orders"])


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "order-service",
        "version": "0.1.0",
        "db": "connected",
    }
