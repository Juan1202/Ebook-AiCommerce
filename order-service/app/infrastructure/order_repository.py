import uuid
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.infrastructure.database import OrderModel, OrderItemModel
from app.domain.models import Order, OrderItem, OrderStatus, PaymentStatus


class OrderRepository:
    @staticmethod
    def create_order(
        db: Session,
        user_id: str,
        items: List[OrderItem],
        shipping_address: str,
        notes: Optional[str] = None,
    ) -> str:
        """Create a new order and return its ID"""
        order_id = str(uuid.uuid4())
        total_price = sum(item.subtotal for item in items)

        order = OrderModel(
            id=order_id,
            user_id=user_id,
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            total_price=total_price,
            shipping_address=shipping_address,
            notes=notes,
        )

        db.add(order)
        db.flush()

        # Add items
        for item in items:
            order_item = OrderItemModel(
                order_id=order_id,
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                subtotal=item.subtotal,
            )
            db.add(order_item)

        db.commit()
        return order_id

    @staticmethod
    def get_order(db: Session, order_id: str) -> Optional[Order]:
        """Get order by ID"""
        order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not order:
            return None

        items = db.query(OrderItemModel).filter(OrderItemModel.order_id == order_id).all()
        order_items = [
            OrderItem(
                book_id=item.book_id,
                title=item.title,
                author=item.author,
                price=item.price,
                quantity=item.quantity,
                condition=item.condition,
                subtotal=item.subtotal,
            )
            for item in items
        ]

        return Order(
            id=order.id,
            user_id=order.user_id,
            status=order.status,
            payment_status=order.payment_status,
            items=order_items,
            total_price=order.total_price,
            shipping_address=order.shipping_address,
            notes=order.notes,
            created_at=order.created_at,
            updated_at=order.updated_at,
        )

    @staticmethod
    def get_user_orders(db: Session, user_id: str, skip: int = 0, limit: int = 50) -> List[Order]:
        """Get all orders for a user"""
        orders = db.query(OrderModel).filter(OrderModel.user_id == user_id).offset(skip).limit(limit).all()

        result = []
        for order in orders:
            items = db.query(OrderItemModel).filter(OrderItemModel.order_id == order.id).all()
            order_items = [
                OrderItem(
                    book_id=item.book_id,
                    title=item.title,
                    author=item.author,
                    price=item.price,
                    quantity=item.quantity,
                    condition=item.condition,
                    subtotal=item.subtotal,
                )
                for item in items
            ]

            result.append(Order(
                id=order.id,
                user_id=order.user_id,
                status=order.status,
                payment_status=order.payment_status,
                items=order_items,
                total_price=order.total_price,
                shipping_address=order.shipping_address,
                notes=order.notes,
                created_at=order.created_at,
                updated_at=order.updated_at,
            ))

        return result

    @staticmethod
    def update_order_status(db: Session, order_id: str, status: OrderStatus) -> bool:
        """Update order status"""
        order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not order:
            return False

        order.status = status
        order.updated_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def update_payment_status(db: Session, order_id: str, payment_status: PaymentStatus) -> bool:
        """Update payment status"""
        order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not order:
            return False

        order.payment_status = payment_status
        if payment_status == PaymentStatus.PAID:
            order.status = OrderStatus.CONFIRMED
        order.updated_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def cancel_order(db: Session, order_id: str) -> bool:
        """Cancel an order"""
        order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not order:
            return False

        order.status = OrderStatus.CANCELLED
        order.updated_at = datetime.utcnow()
        db.commit()
        return True
