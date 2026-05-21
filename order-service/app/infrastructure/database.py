from sqlalchemy import create_engine, Column, Integer, String, DateTime, Enum as SQLEnum, Float, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.config import settings, OrderStatus, PaymentStatus

engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(255), index=True, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    payment_status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    total_price = Column(Integer, nullable=False)  # Price in cents
    shipping_address = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class OrderItemModel(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(36), ForeignKey("orders.id"), nullable=False, index=True)
    book_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)  # Price in cents
    quantity = Column(Integer, default=1, nullable=False)
    condition = Column(String(50), nullable=False)
    subtotal = Column(Integer, nullable=False)  # Price * quantity in cents


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
