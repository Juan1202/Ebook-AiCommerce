from fastapi import FastAPI
from app.routers.quality_router import router

app = FastAPI(title="Data Quality Module", version="1.0.0")
app.include_router(router, prefix="/quality")


@app.get("/health")
def health():
    return {"status": "ok", "service": "data-quality-module"}
