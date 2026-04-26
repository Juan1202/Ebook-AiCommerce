from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.application.audit_use_cases import seed_initial_audits
from app.infrastructure.database import Base, SessionLocal, engine
from app.routers.audit_router import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_initial_audits(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Audit Service",
    description="Servicio de auditoría para decisiones de pricing y enriquecimiento.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router, prefix="/audit", tags=["audit"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "audit-service"}
