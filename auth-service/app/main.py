import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.infrastructure.database import Base, engine
from app.routers import auth_router


def wait_for_db(engine, retries=20, delay=3):
    for attempt in range(retries):
        try:
            with engine.connect():
                return
        except OperationalError:
            if attempt == retries - 1:
                raise
            time.sleep(delay)


wait_for_db(engine)
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
