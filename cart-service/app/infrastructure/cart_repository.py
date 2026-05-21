from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.infrastructure.database import CartItemModel, CartModel
from app.domain.models import Cart, CartItem


class CartRepository:
    @staticmethod
    def get_or_create_cart(db: Session, cart_id: str) -> CartModel:
        """Get or create a cart for the user"""
        cart = db.query(CartModel).filter(CartModel.id == cart_id).first()
        if not cart:
            cart = CartModel(id=cart_id, total_items=0, total_price=0)
            db.add(cart)
            db.commit()
        return cart

    @staticmethod
    def get_cart(db: Session, cart_id: str) -> Optional[Cart]:
        """Get cart with all items"""
        cart = db.query(CartModel).filter(CartModel.id == cart_id).first()
        if not cart:
            return None

        items = db.query(CartItemModel).filter(CartItemModel.cart_id == cart_id).all()
        cart_items = [
            CartItem(
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                added_at=item.added_at,
            )
            for item in items
        ]

        return Cart(
            id=cart.id,
            items=cart_items,
            created_at=cart.created_at,
            updated_at=cart.updated_at,
        )

    @staticmethod
    def add_item(db: Session, cart_id: str, item: CartItem) -> CartModel:
        """Add or update item in cart"""
        # Get or create cart
        cart = CartRepository.get_or_create_cart(db, cart_id)

        # Check if item already exists
        existing = db.query(CartItemModel).filter(
            CartItemModel.cart_id == cart_id,
            CartItemModel.book_id == item.book_id,
            CartItemModel.condition == item.condition,
        ).first()

        if existing:
            existing.quantity += item.quantity
        else:
            cart_item = CartItemModel(
                cart_id=cart_id,
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                added_at=item.added_at,
            )
            db.add(cart_item)

        # Update cart totals
        cart.updated_at = datetime.utcnow()
        all_items = db.query(CartItemModel).filter(CartItemModel.cart_id == cart_id).all()
        cart.total_items = sum(i.quantity for i in all_items)
        cart.total_price = sum(i.price * i.quantity for i in all_items)

        db.commit()
        return cart

    @staticmethod
    def remove_item(db: Session, cart_id: str, book_id: int, condition: Optional[str] = None) -> bool:
        """Remove item from cart"""
        query = db.query(CartItemModel).filter(
            CartItemModel.cart_id == cart_id,
            CartItemModel.book_id == book_id,
        )
        if condition:
            query = query.filter(CartItemModel.condition == condition)

        count = query.delete()

        if count > 0:
            cart = db.query(CartModel).filter(CartModel.id == cart_id).first()
            if cart:
                cart.updated_at = datetime.utcnow()
                all_items = db.query(CartItemModel).filter(CartItemModel.cart_id == cart_id).all()
                cart.total_items = sum(i.quantity for i in all_items)
                cart.total_price = sum(i.price * i.quantity for i in all_items)

            db.commit()
            return True
        return False

    @staticmethod
    def update_item_quantity(db: Session, cart_id: str, book_id: int, quantity: int, condition: str) -> bool:
        """Update item quantity"""
        item = db.query(CartItemModel).filter(
            CartItemModel.cart_id == cart_id,
            CartItemModel.book_id == book_id,
            CartItemModel.condition == condition,
        ).first()

        if not item:
            return False

        if quantity <= 0:
            return CartRepository.remove_item(db, cart_id, book_id, condition)

        item.quantity = quantity
        cart = db.query(CartModel).filter(CartModel.id == cart_id).first()
        if cart:
            cart.updated_at = datetime.utcnow()
            all_items = db.query(CartItemModel).filter(CartItemModel.cart_id == cart_id).all()
            cart.total_items = sum(i.quantity for i in all_items)
            cart.total_price = sum(i.price * i.quantity for i in all_items)

        db.commit()
        return True

    @staticmethod
    def clear_cart(db: Session, cart_id: str) -> None:
        """Clear all items from cart"""
        db.query(CartItemModel).filter(CartItemModel.cart_id == cart_id).delete()
        cart = db.query(CartModel).filter(CartModel.id == cart_id).first()
        if cart:
            cart.total_items = 0
            cart.total_price = 0
            cart.updated_at = datetime.utcnow()
        db.commit()
