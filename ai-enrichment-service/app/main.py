from fastapi import FastAPI

from app.infrastructure.database.connection import Base, engine
from app.infrastructure.database.models import EnrichmentRequestModel, EnrichmentResultModel  # noqa: F401 — registers models
from app.routers.enrichment_router import router as enrichment_router
from app.routers.upload_router import router as upload_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BookFlow AI Enrichment Service",
    version="2.5.0",
    description="Servicio de enriquecimiento bibliográfico con categorías, stock, estado, deduplicación e integración a catálogo",
)

app.include_router(enrichment_router)
app.include_router(upload_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-enrichment-service"}
