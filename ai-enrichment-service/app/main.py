from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.database.connection import Base, engine
from app.routers.enrichment_router import router as enrichment_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BookFlow — AI Enrichment Service",
    description="Enriquecimiento de metadatos bibliográficos mediante APIs externas",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(enrichment_router, tags=["enrichment"])


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-enrichment-service",
        "version": "2.0.0",
    }
