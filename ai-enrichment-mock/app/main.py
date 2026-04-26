from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.enrichment_router import router

app = FastAPI(title="AI Enrichment Mock", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/enrichment")


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-enrichment-mock"}
