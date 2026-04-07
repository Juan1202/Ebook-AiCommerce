from fastapi import FastAPI
from app.routers.enrichment_router import router

app = FastAPI(title="AI Enrichment Mock", version="1.0.0")
app.include_router(router)
