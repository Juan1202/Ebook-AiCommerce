from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


@dataclass
class CartItem:
    """Represents an item in a shopping cart"""
    book_id: int
    title: str
    author: str
    price: int  # in cents
    quantity: int
    condition: str
    added_at: datetime


@dataclass
class Cart:
    """Represents a shopping cart"""
    id: str  # User ID or session ID
    items: List[CartItem]
    created_at: datetime
    updated_at: datetime

    def get_total_price(self) -> int:
        """Calculate total price in cents"""
        return sum(item.price * item.quantity for item in self.items)

    def get_item_count(self) -> int:
        """Get total quantity of items"""
        return sum(item.quantity for item in self.items)

    def add_item(self, item: CartItem) -> None:
        """Add or update item in cart"""
        for existing_item in self.items:
            if existing_item.book_id == item.book_id and existing_item.condition == item.condition:
                existing_item.quantity += item.quantity
                self.updated_at = datetime.utcnow()
                return
        self.items.append(item)
        self.updated_at = datetime.utcnow()

    def remove_item(self, book_id: int, condition: Optional[str] = None) -> bool:
        """Remove item from cart"""
        initial_count = len(self.items)
        self.items = [
            item for item in self.items
            if not (item.book_id == book_id and (condition is None or item.condition == condition))
        ]
        if len(self.items) < initial_count:
            self.updated_at = datetime.utcnow()
            return True
        return False

    def clear(self) -> None:
        """Clear all items from cart"""
        self.items = []
        self.updated_at = datetime.utcnow()
