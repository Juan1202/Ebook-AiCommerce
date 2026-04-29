from __future__ import annotations

import datetime as dt

from sqlalchemy import (Column, DateTime, Enum as SAEnum, Float, ForeignKey,
                        Integer, String, Text)
from sqlalchemy.orm import relationship

from app.domain.entities.order import OrderStatus
from app.infrastructure.database.connection import Base


class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String(100), index=True, nullable=False)
    status = Column(
        SAEnum(OrderStatus, name="order_status"),
        nullable=False,
        default=OrderStatus.PENDING,
    )
    total_amount = Column(Float, nullable=False, default=0.0)
    cancel_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    confirmed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    fulfilled_at = Column(DateTime, nullable=True)

    items = relationship(
        "OrderItemModel",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="joined",
    )


class OrderItemModel(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    book_id = Column(String(100), nullable=False, index=True)
    book_title = Column(String(500), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    order = relationship("OrderModel", back_populates="items")
