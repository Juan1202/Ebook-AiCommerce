import time

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.infrastructure.database import Base, engine, SessionLocal
from app.infrastructure.catalog_repository import seed_categories, seed_books
from app.routers import catalog_router, category_router


def wait_for_db(engine, retries=20, delay=3):
    for attempt in range(retries):
        try:
            with engine.connect():
                return
        except OperationalError:
            if attempt == retries - 1:
                raise
            time.sleep(delay)


@asynccontextmanager
async def lifespan(app: FastAPI):
    wait_for_db(engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_categories(db)
        seed_books(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="BookFlow — Catalog Service",
    description="Catálogo comercial de libros y publicaciones",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(category_router.router, prefix="/categories", tags=["categories"])
app.include_router(catalog_router.router, prefix="/books", tags=["books"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "catalog-service"}
