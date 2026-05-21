from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class CartItemModel(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(String(255), index=True, nullable=False)
    book_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False)  # Price in cents
    quantity = Column(Integer, default=1, nullable=False)
    condition = Column(String(50), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class CartModel(Base):
    __tablename__ = "carts"

    id = Column(String(255), primary_key=True, index=True)
    total_items = Column(Integer, default=0, nullable=False)
    total_price = Column(Integer, default=0, nullable=False)  # Price in cents
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
