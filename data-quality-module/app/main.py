from fastapi import FastAPI
from app.routers.quality_router import router

app = FastAPI(title="Data Quality Module", version="1.0.0")
app.include_router(router, prefix="/quality")
