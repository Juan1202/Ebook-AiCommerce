import re
import requests
import pandas as pd

from fastapi import FastAPI, UploadFile, File
from app.database import Base, engine, SessionLocal
from app.models import EnrichmentRequest, EnrichmentResult
from app.external_apis import google_books, open_library
from app.config import CATALOG_SERVICE_URL


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BookFlow AI Enrichment Service",
    version="2.5.0",
    description="Servicio de enriquecimiento bibliográfico real con categorías, stock, estado, deduplicación e integración a catálogo"
)


def clean_value(value):
    if value is None:
        return ""
    value = str(value).strip()
    if value.lower() in ["nan", "none", "null"]:
        return ""
    return value


def clean_isbn(value):
    value = clean_value(value)
    return re.sub(r"[^0-9Xx]", "", value)


def clean_stock(value):
    try:
        if value is None or str(value).strip().lower() in ["", "nan", "none", "null"]:
            return None
        return int(float(value))
    except Exception:
        return None


def normalize_text(value):
    value = clean_value(value).lower()
    value = re.sub(r"[^a-záéíóúñ0-9 ]", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value


def generate_placeholder_cover(title: str):
    safe_title = clean_value(title) or "Libro"
    safe_title = safe_title.replace(" ", "+")
    return f"https://placehold.co/300x450/2F6F52/FFFFFF?text={safe_title}&font=roboto"


def map_category_id(categories, title="", description=""):
    text = " ".join(categories or []).lower()
    text += " " + normalize_text(title)
    text += " " + normalize_text(description)

    if "clean code" in text:
        return 7
    if "atomic habits" in text:
        return 2
    if "rich dad poor dad" in text or "padre rico" in text or "padre pobre" in text:
        return 10
    if "sapiens" in text or "de animales a dioses" in text:
        return 4
    if "the road" in text:
        return 1
    if "pensar rapido" in text or "pensar rápido" in text or "thinking fast and slow" in text or "daniel kahneman" in text:
        return 2
    if "capitalismo de la vigilancia" in text:
        return 7

    if any(word in text for word in [
        "computer", "computers", "programming", "software", "technology",
        "data", "engineering", "code", "coding", "developer",
        "architecture", "python", "java", "javascript", "database",
        "algorithm", "systems", "digital", "artificial intelligence"
    ]):
        return 7

    if any(word in text for word in [
        "business", "economics", "finance", "money", "management",
        "investment", "financial", "negocios", "finanzas", "economía",
        "economia", "empresa", "mercado", "capitalism", "capitalismo"
    ]):
        return 10

    if any(word in text for word in [
        "history", "historical", "civilization", "anthropology",
        "humanity", "humanidad", "historia", "war", "guerra"
    ]):
        return 4

    if any(word in text for word in [
        "science", "physics", "biology", "chemistry", "mathematics",
        "cosmos", "universe", "astronomy", "energy", "solar",
        "photovoltaic", "fotovoltaica"
    ]):
        return 3

    if any(word in text for word in [
        "self-help", "psychology", "personal", "habits", "habit",
        "mind", "success", "health", "behavior", "productivity",
        "autoayuda", "psicología", "psicologia", "decisiones"
    ]):
        return 2

    if any(word in text for word in [
        "philosophy", "stoic", "ethics", "meditations", "sofía",
        "filosofía", "filosofia"
    ]):
        return 5

    if any(word in text for word in [
        "law", "legal", "derecho", "jurídico", "juridico"
    ]):
        return 9

    if any(word in text for word in [
        "children", "juvenile fiction", "kids", "infantil"
    ]):
        return 8

    if any(word in text for word in [
        "painting", "music", "drawing", "art history", "artes", "arte", "design"
    ]):
        return 6

    if any(word in text for word in [
        "fiction", "novel", "fantasy", "romance", "mystery",
        "thriller", "story", "stories", "literature", "novela"
    ]):
        return 1

    return 2


def catalog_book_exists(isbn: str, title: str):
    try:
        response = requests.get(
            f"{CATALOG_SERVICE_URL}/books/?limit=100000",
            timeout=15
        )

        if response.status_code != 200:
            return None

        books = response.json()

        current_isbn = clean_isbn(isbn)
        current_title = normalize_text(title)

        for book in books:
            existing_isbn = clean_isbn(book.get("isbn"))
            existing_title = normalize_text(book.get("title"))

            if current_isbn and existing_isbn and current_isbn == existing_isbn:
                return book

            if current_title and existing_title and current_title == existing_title:
                return book

        return None

    except Exception:
        return None


def choose_best_result(google_result, open_result, fallback_result):
    if google_result and open_result:
        selected = google_result.copy()
        selected["source"] = "Google Books + Open Library"

        if not clean_value(selected.get("title")):
            selected["title"] = open_result.get("title")

        if not clean_value(selected.get("author")):
            selected["author"] = open_result.get("author")

        if not clean_value(selected.get("publisher")):
            selected["publisher"] = open_result.get("publisher")

        if not clean_value(selected.get("publication_year")):
            selected["publication_year"] = open_result.get("publication_year")

        if not clean_value(selected.get("description")):
            selected["description"] = open_result.get("description")

        if not clean_value(selected.get("cover")):
            selected["cover"] = open_result.get("cover")

        google_categories = google_result.get("categories") or []
        open_categories = open_result.get("categories") or []
        selected["categories"] = list(dict.fromkeys(google_categories + open_categories))
        selected["confidence"] = "HIGH"

        return selected

    if google_result:
        return google_result

    if open_result:
        return open_result

    return fallback_result


def sync_with_catalog(result: dict, isbn: str):
    title = clean_value(result.get("title")) or "Título no disponible"
    author = clean_value(result.get("author")) or "Autor no disponible"
    isbn = clean_isbn(isbn)

    existing = catalog_book_exists(isbn, title)

    if existing:
        return {
            "status": "ALREADY_EXISTS",
            "catalog_book": existing
        }

    try:
        cover = clean_value(result.get("cover")) or generate_placeholder_cover(title)

        category_id = map_category_id(
            result.get("categories", []),
            title=title,
            description=result.get("description")
        )

        payload = {
            "title": title,
            "author": author,
            "isbn": isbn or None,
            "publisher": clean_value(result.get("publisher")) or None,
            "publication_year": result.get("publication_year") if result.get("publication_year") else None,
            "description": clean_value(result.get("description")) or f"Libro enriquecido automáticamente desde {result.get('source')}.",
            "cover_url": cover,
            "category_id": category_id,
            "price": None,
            "condition": clean_value(result.get("condition")) or None,
            "stock": result.get("stock") if result.get("stock") is not None else None,
            "published_flag": True
        }

        response = requests.post(
            f"{CATALOG_SERVICE_URL}/books/",
            json=payload,
            timeout=10
        )

        if response.status_code in [200, 201]:
            return {
                "status": "SYNCED",
                "catalog_book": response.json()
            }

        return {
            "status": "FAILED",
            "catalog_status_code": response.status_code,
            "catalog_response": response.text
        }

    except Exception as e:
        return {
            "status": "ERROR",
            "message": str(e)
        }


def enrich_book_logic(payload: dict):
    db = SessionLocal()

    try:
        isbn = clean_isbn(payload.get("isbn"))
        title = clean_value(payload.get("title"))
        author = clean_value(payload.get("author"))
        cover_from_excel = clean_value(payload.get("cover"))
        condition = clean_value(payload.get("condition"))
        stock = clean_stock(payload.get("stock"))

        existing = catalog_book_exists(isbn, title)

        if existing:
            return {
                "enrichment_request_id": None,
                "source": "Existing Catalog",
                "title": existing.get("title"),
                "author": existing.get("author"),
                "publisher": existing.get("publisher"),
                "publication_year": existing.get("publication_year"),
                "description": existing.get("description"),
                "categories": [],
                "cover": existing.get("cover_url"),
                "condition": existing.get("condition"),
                "stock": existing.get("stock"),
                "confidence": "HIGH",
                "catalog_sync": {
                    "status": "ALREADY_EXISTS",
                    "catalog_book": existing
                }
            }

        req = EnrichmentRequest(
            isbn=isbn,
            title=title,
            author=author
        )

        db.add(req)
        db.commit()
        db.refresh(req)

        google_result = None
        open_result = None

        if isbn or title:
            google_result = google_books(isbn=isbn, title=title, author=author)

        if isbn:
            open_result = open_library(isbn=isbn, title=title, author=author)

        fallback_result = {
            "source": "Fallback",
            "title": title or "Título no disponible",
            "author": author or "Autor no disponible",
            "publisher": None,
            "publication_year": None,
            "description": None,
            "cover": cover_from_excel,
            "categories": [],
            "confidence": "LOW"
        }

        result = choose_best_result(
            google_result,
            open_result,
            fallback_result
        )

        if not clean_value(result.get("title")):
            result["title"] = title or "Título no disponible"

        if not clean_value(result.get("author")):
            result["author"] = author or "Autor no disponible"

        if not clean_value(result.get("cover")):
            result["cover"] = cover_from_excel or generate_placeholder_cover(result["title"])

        result["condition"] = condition
        result["stock"] = stock

        save = EnrichmentResult(
            request_id=req.id,
            source=result["source"],
            confidence=result["confidence"],
            normalized_title=result["title"],
            normalized_author=result["author"],
            cover_url=result["cover"]
        )

        db.add(save)
        db.commit()

        catalog_sync = sync_with_catalog(result, isbn)

        return {
            "enrichment_request_id": req.id,
            "source": result["source"],
            "title": result["title"],
            "author": result["author"],
            "publisher": result.get("publisher"),
            "publication_year": result.get("publication_year"),
            "description": result.get("description"),
            "categories": result.get("categories", []),
            "cover": result["cover"],
            "condition": result.get("condition"),
            "stock": result.get("stock"),
            "confidence": result["confidence"],
            "catalog_sync": catalog_sync
        }

    finally:
        db.close()


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-enrichment-service"
    }


@app.get("/external-apis/status")
def external_status():
    return {
        "google_books": "ACTIVE",
        "open_library": "ACTIVE",
        "catalog_service": CATALOG_SERVICE_URL
    }


@app.post("/enrich")
def enrich(payload: dict):
    return enrich_book_logic(payload)


@app.get("/enrich/{id}")
def get_result(id: int):
    db = SessionLocal()

    try:
        result = db.query(EnrichmentResult).filter(
            EnrichmentResult.request_id == id
        ).first()

        if not result:
            return {"message": "No encontrado"}

        return {
            "id": result.id,
            "request_id": result.request_id,
            "source": result.source,
            "confidence": result.confidence,
            "title": result.normalized_title,
            "author": result.normalized_author,
            "cover": result.cover_url
        }

    finally:
        db.close()


@app.post("/upload-excel")
def upload_excel(file: UploadFile = File(...), limit: int = 50):
    df = pd.read_excel(file.file)

    inserted = []
    duplicated = []
    errors = []
    processed_keys = set()

    if limit and limit > 0:
        df = df.head(limit)

    for index, row in df.iterrows():
        try:
            isbn_13 = clean_isbn(row.get("ISBN 13"))
            isbn_10 = clean_isbn(row.get("ISBN 10"))
            issn = clean_isbn(row.get("ISSN"))

            title = clean_value(row.get("Título del libro"))
            cover = clean_value(row.get("URL PORTADA"))
            condition = clean_value(row.get("Estado del libro"))
            stock = clean_stock(row.get("unidades disponibles"))

            isbn = isbn_13 or isbn_10 or issn
            unique_key = isbn if isbn else normalize_text(title)

            if not unique_key:
                errors.append({
                    "row": index + 1,
                    "error": "Fila sin ISBN, ISSN ni título"
                })
                continue

            if unique_key in processed_keys:
                duplicated.append({
                    "row": index + 1,
                    "isbn": isbn,
                    "title": title,
                    "reason": "Duplicado dentro del Excel"
                })
                continue

            processed_keys.add(unique_key)

            payload = {
                "isbn": isbn,
                "title": title,
                "author": "",
                "cover": cover,
                "condition": condition,
                "stock": stock
            }

            result = enrich_book_logic(payload)
            sync_status = result["catalog_sync"]["status"]

            if sync_status == "ALREADY_EXISTS":
                duplicated.append({
                    "row": index + 1,
                    "isbn": isbn,
                    "title": result["title"],
                    "reason": "Ya existe en catálogo"
                })
                continue

            if sync_status != "SYNCED":
                errors.append({
                    "row": index + 1,
                    "isbn": isbn,
                    "title": result["title"],
                    "error": result["catalog_sync"]
                })
                continue

            inserted.append({
                "row": index + 1,
                "isbn": isbn,
                "title": result["title"],
                "author": result["author"],
                "source": result["source"],
                "confidence": result["confidence"],
                "condition": result.get("condition"),
                "stock": result.get("stock"),
                "catalog_sync": sync_status
            })

        except Exception as e:
            errors.append({
                "row": index + 1,
                "error": str(e)
            })

    return {
        "total_rows_processed": len(df),
        "inserted": len(inserted),
        "duplicated": len(duplicated),
        "errors": len(errors),
        "inserted_preview": inserted[:20],
        "duplicated_preview": duplicated[:20],
        "error_preview": errors[:10]
    }