import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:bookflow123@enrichment-db:5432/enrichment_db"
)

CATALOG_SERVICE_URL = os.getenv(
    "CATALOG_SERVICE_URL",
    "http://catalog-service:8003"
)

PORT = int(os.getenv("PORT", 8004))