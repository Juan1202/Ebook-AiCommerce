from enum import Enum
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional


class OrderStatus(str, Enum):
    """Order status enumeration"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    FAILED = "failed"


class PaymentStatus(str, Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


@dataclass
class OrderItem:
    """Represents an item in an order"""
    book_id: int
    title: str
    author: str
    price: int  # in cents
    quantity: int
    condition: str
    subtotal: int  # price * quantity in cents


@dataclass
class Order:
    """Represents a complete order"""
    id: str
    user_id: str
    status: OrderStatus
    payment_status: PaymentStatus
    items: List[OrderItem]
    total_price: int  # in cents
    shipping_address: str
    notes: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

    def calculate_total(self) -> int:
        """Calculate total price from items"""
        return sum(item.subtotal for item in self.items)
