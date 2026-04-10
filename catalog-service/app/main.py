from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.infrastructure.database import Base, engine, SessionLocal
from app.infrastructure.catalog_repository import seed_categories, seed_books
from app.routers import catalog_router, category_router

Base.metadata.create_all(bind=engine)

# Seed initial data
_db = SessionLocal()
try:
    seed_categories(_db)
    seed_books(_db)
finally:
    _db.close()

app = FastAPI(
    title="BookFlow — Catalog Service",
    description="Catálogo comercial de libros y publicaciones",
    version="1.0.0",
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
