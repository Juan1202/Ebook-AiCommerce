from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from app.application.use_cases.enrich_book import EnrichBookUseCase
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories.enrichment_repository import EnrichmentRepository
from app.infrastructure.adapters import (crossref_adapter, google_books_adapter,
                                          open_library_adapter)

router = APIRouter()


class EnrichRequest(BaseModel):
    book_id: str
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None


@router.post("/enrich")
async def enrich_book(payload: EnrichRequest, db: Session = Depends(get_db)):
    if not payload.isbn and not payload.title:
        raise HTTPException(status_code=422, detail="isbn or title is required")

    repo = EnrichmentRepository(db)
    use_case = EnrichBookUseCase(repo)
    result = await use_case.execute(
        book_id=payload.book_id,
        isbn=payload.isbn,
        title=payload.title,
        author=payload.author,
        publisher=payload.publisher,
    )
    return result


@router.get("/enrich/{request_id}")
def get_enrichment(request_id: int, db: Session = Depends(get_db)):
    repo = EnrichmentRepository(db)
    req = repo.get_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Enrichment request not found")
    result = repo.get_result_by_request(request_id)
    return {
        "request_id": req.id,
        "book_id": req.book_id,
        "status": req.status,
        "source_used": req.source_used,
        "error_message": req.error_message,
        "result": {
            "normalized_title": result.normalized_title if result else None,
            "normalized_author": result.normalized_author if result else None,
            "normalized_publisher": result.normalized_publisher if result else None,
            "normalized_description": result.normalized_description if result else None,
            "cover_url": result.cover_url if result else None,
            "confidence_score": result.confidence_score if result else 0.0,
        } if result else None,
    }


@router.get("/external-apis/status")
def external_apis_status():
    return {
        "apis": [
            google_books_adapter.get_status(),
            open_library_adapter.get_status(),
            crossref_adapter.get_status(),
        ]
    }
