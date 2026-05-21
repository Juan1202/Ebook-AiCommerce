import time

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.infrastructure.database import Base, engine
from app.routers import cart_router


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
    yield


app = FastAPI(
    title="BookFlow — Cart Service",
    description="Shopping cart management service",
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

app.include_router(cart_router.router, prefix="/carts", tags=["carts"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "cart-service"}
