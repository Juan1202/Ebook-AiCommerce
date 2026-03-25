from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.inventory_use_cases import (
    check_availability, get_all_items, get_item,
)
from app.infrastructure.database import get_db

router = APIRouter()


class ItemResponse(BaseModel):
    id: int
    external_code: Optional[str]
    book_reference: str
    title: str
    author: str
    isbn: Optional[str]
    quantity_available: int
    quantity_reserved: int
    condition: str
    defects: Optional[str]
    observations: Optional[str]
    import_batch_id: Optional[int]
    created_at: Optional[datetime]


def _resp(i) -> ItemResponse:
    return ItemResponse(
        id=i.id, external_code=i.external_code, book_reference=i.book_reference,
        title=i.title, author=i.author, isbn=i.isbn,
        quantity_available=i.quantity_available, quantity_reserved=i.quantity_reserved,
        condition=i.condition.value, defects=i.defects, observations=i.observations,
        import_batch_id=i.import_batch_id, created_at=i.created_at,
    )


@router.get("/", response_model=List[ItemResponse])
def list_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return [_resp(i) for i in get_all_items(db, skip, limit)]


@router.get("/availability/{book_reference}")
def availability(book_reference: str, db: Session = Depends(get_db)):
    qty = check_availability(db, book_reference)
    return {"book_reference": book_reference, "quantity_available": qty, "is_available": qty > 0}


@router.get("/{item_id}", response_model=ItemResponse)
def get_one(item_id: int, db: Session = Depends(get_db)):
    item = get_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Ítem no encontrado")
    return _resp(item)
