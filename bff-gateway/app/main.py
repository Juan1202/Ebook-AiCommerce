from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.gateway_router import router

app = FastAPI(title="BFF Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
