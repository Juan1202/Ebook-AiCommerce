from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.infrastructure.database import get_db
from app.infrastructure.cart_repository import CartRepository
from app.domain.models import CartItem

router = APIRouter()


# ─────────────────────────────────────────
# Pydantic Models for API
# ─────────────────────────────────────────

class CartItemRequest(BaseModel):
    book_id: int
    title: str
    author: str
    price: int  # in cents
    quantity: int
    condition: str


class CartItemResponse(BaseModel):
    book_id: int
    title: str
    author: str
    price: int  # in cents
    quantity: int
    condition: str
    added_at: datetime


class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    total_items: int
    total_price: int  # in cents
    created_at: datetime
    updated_at: datetime


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "service": "cart-service"}


@router.get("/{cart_id}", response_model=CartResponse)
def get_cart(cart_id: str, db: Session = Depends(get_db)):
    """Get cart contents"""
    cart = CartRepository.get_cart(db, cart_id)
    if not cart:
        # Return empty cart
        CartRepository.get_or_create_cart(db, cart_id)
        cart = CartRepository.get_cart(db, cart_id)

    return CartResponse(
        id=cart.id,
        items=[
            CartItemResponse(
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                added_at=item.added_at,
            )
            for item in cart.items
        ],
        total_items=sum(item.quantity for item in cart.items),
        total_price=sum(item.price * item.quantity for item in cart.items),
        created_at=cart.created_at,
        updated_at=cart.updated_at,
    )


@router.post("/{cart_id}/items", response_model=CartResponse)
def add_item_to_cart(cart_id: str, item_request: CartItemRequest, db: Session = Depends(get_db)):
    """Add item to cart"""
    cart_item = CartItem(
        book_id=item_request.book_id,
        title=item_request.title,
        author=item_request.author,
        price=item_request.price,
        quantity=item_request.quantity,
        condition=item_request.condition,
        added_at=datetime.utcnow(),
    )

    CartRepository.add_item(db, cart_id, cart_item)
    cart = CartRepository.get_cart(db, cart_id)

    return CartResponse(
        id=cart.id,
        items=[
            CartItemResponse(
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                added_at=item.added_at,
            )
            for item in cart.items
        ],
        total_items=sum(item.quantity for item in cart.items),
        total_price=sum(item.price * item.quantity for item in cart.items),
        created_at=cart.created_at,
        updated_at=cart.updated_at,
    )


@router.put("/{cart_id}/items/{book_id}")
def update_item_quantity(
    cart_id: str,
    book_id: int,
    quantity: int = Query(..., ge=0),
    condition: str = Query(...),
    db: Session = Depends(get_db),
):
    """Update item quantity in cart"""
    success = CartRepository.update_item_quantity(db, cart_id, book_id, quantity, condition)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    cart = CartRepository.get_cart(db, cart_id)
    return CartResponse(
        id=cart.id,
        items=[
            CartItemResponse(
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                added_at=item.added_at,
            )
            for item in cart.items
        ],
        total_items=sum(item.quantity for item in cart.items),
        total_price=sum(item.price * item.quantity for item in cart.items),
        created_at=cart.created_at,
        updated_at=cart.updated_at,
    )


@router.delete("/{cart_id}/items/{book_id}")
def remove_item_from_cart(
    cart_id: str,
    book_id: int,
    condition: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Remove item from cart"""
    success = CartRepository.remove_item(db, cart_id, book_id, condition)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    cart = CartRepository.get_cart(db, cart_id)
    if not cart:
        CartRepository.get_or_create_cart(db, cart_id)
        cart = CartRepository.get_cart(db, cart_id)

    return CartResponse(
        id=cart.id,
        items=[
            CartItemResponse(
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                added_at=item.added_at,
            )
            for item in cart.items
        ],
        total_items=sum(item.quantity for item in cart.items),
        total_price=sum(item.price * item.quantity for item in cart.items),
        created_at=cart.created_at,
        updated_at=cart.updated_at,
    )


@router.delete("/{cart_id}")
def clear_cart(cart_id: str, db: Session = Depends(get_db)):
    """Clear entire cart"""
    CartRepository.clear_cart(db, cart_id)
    return {"message": "Cart cleared successfully"}
