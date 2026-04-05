from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.database import Base, engine
from app.routers import auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BookFlow — Auth Service",
    description="Autenticación JWT para la plataforma BookFlow",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth", tags=["auth"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "auth-service"}
