from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.audit import init_audit_db
from app.routers.audit_router import router as audit_router
from app.routers.gateway_router import router as gateway_router

app = FastAPI(
    title="BFF Gateway",
    description="Proxy central que enruta peticiones de los frontends hacia los microservicios. Devuelve 503 controlado si un servicio no está disponible.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_audit_db()

app.include_router(audit_router)
app.include_router(gateway_router)
