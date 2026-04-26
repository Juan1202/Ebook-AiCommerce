from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.database import Base, engine
from app.routers.pricing_router import router as pricing_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BookFlow — Pricing Service",
    description="Servicio de cálculo de precios sugeridos para libros",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pricing_router, prefix="/pricing", tags=["pricing"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "pricing-service"}
