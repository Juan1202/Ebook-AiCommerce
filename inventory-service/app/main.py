from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.database import Base, engine
from app.routers import batch_router, inventory_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BookFlow — Inventory Service",
    description="Gestión de inventario y carga masiva de archivos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory_router.router, prefix="/inventory", tags=["inventory"])
app.include_router(batch_router.router, prefix="/batches", tags=["batches"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "inventory-service"}
