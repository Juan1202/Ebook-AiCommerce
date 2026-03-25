from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.application.enrichment_use_cases import enrich_single, enrich_batch
from app.domain.enrichment import EnrichmentRequest

router = APIRouter()


class EnrichRequestBody(BaseModel):
    book_reference: str
    title: str
    author: str
    isbn: Optional[str] = None
    issn: Optional[str] = None


class EnrichBatchBody(BaseModel):
    items: List[EnrichRequestBody]


@router.post("/enrich")
def enrich_book(body: EnrichRequestBody):
    req = EnrichmentRequest(
        book_reference=body.book_reference,
        title=body.title,
        author=body.author,
        isbn=body.isbn,
        issn=body.issn,
    )
    result = enrich_single(req)
    return result.__dict__


@router.post("/enrich/batch")
def enrich_books_batch(body: EnrichBatchBody):
    requests = [
        EnrichmentRequest(
            book_reference=item.book_reference,
            title=item.title,
            author=item.author,
            isbn=item.isbn,
            issn=item.issn,
        )
        for item in body.items
    ]
    results = enrich_batch(requests)
    return [r.__dict__ for r in results]


@router.get("/health")
def health():
    return {"status": "ok", "service": "ai-enrichment-mock"}
