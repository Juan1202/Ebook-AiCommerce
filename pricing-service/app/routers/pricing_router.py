from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.use_cases.calculate_price import CalculatePriceUseCase
from app.domain.entities.pricing import BookCondition
from app.infrastructure.adapters import ebay_adapter
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories.pricing_repository import PricingRepository

router = APIRouter(prefix="/pricing", tags=["pricing"])


class CalculateRequest(BaseModel):
    book_id: str
    isbn: Optional[str] = None
    title: Optional[str] = None
    condition: BookCondition = BookCondition.BUENO
    publication_year: Optional[int] = None


@router.post("/calculate")
async def calculate_price(request: CalculateRequest, db: Session = Depends(get_db)):
    repo = PricingRepository(db)
    use_case = CalculatePriceUseCase(repo)
    result = await use_case.execute(
        book_id=request.book_id,
        isbn=request.isbn,
        title=request.title,
        condition=request.condition,
        publication_year=request.publication_year,
    )
    return result


@router.get("/{book_id}")
def get_latest_price(book_id: str, db: Session = Depends(get_db)):
    repo = PricingRepository(db)
    decision = repo.get_latest_decision(book_id)
    if not decision:
        raise HTTPException(status_code=404, detail="No pricing decision found for this book")
    return {
        "book_id": decision.book_reference,
        "suggested_price": decision.suggested_price,
        "currency": decision.currency,
        "explanation": decision.explanation,
        "source": decision.source,
        "condition_factor": decision.condition_factor,
        "base_price": decision.base_price,
        "references_found": decision.reference_count,
        "is_fallback": decision.is_fallback,
        "calculated_at": decision.created_at.isoformat(),
    }


@router.get("/{book_id}/history")
def get_price_history(book_id: str, db: Session = Depends(get_db)):
    repo = PricingRepository(db)
    history = repo.get_decision_history(book_id)
    return [
        {
            "id": d.id,
            "suggested_price": d.suggested_price,
            "currency": d.currency,
            "source": d.source,
            "condition_factor": d.condition_factor,
            "is_fallback": d.is_fallback,
            "calculated_at": d.created_at.isoformat(),
        }
        for d in history
    ]


@router.get("/{book_id}/explanation")
def get_price_explanation(book_id: str, db: Session = Depends(get_db)):
    repo = PricingRepository(db)
    decision = repo.get_latest_decision(book_id)
    if not decision:
        raise HTTPException(status_code=404, detail="No pricing decision found for this book")
    return {
        "book_id": decision.book_reference,
        "explanation": decision.explanation,
        "base_price": decision.base_price,
        "condition_factor": decision.condition_factor,
        "suggested_price": decision.suggested_price,
        "adjustment_reasons": decision.adjustment_reasons,
        "source": decision.source,
        "is_fallback": decision.is_fallback,
        "references": [
            {
                "source": r.source,
                "price": r.external_price,
                "currency": r.currency,
                "observed_at": r.observed_at.isoformat(),
            }
            for r in repo.get_references_for_book(book_id)
        ],
    }


@router.get("/external-apis/status")
def get_external_api_status():
    return {"apis": [ebay_adapter.get_status()]}
