from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY

from app.infrastructure.database.connection import Base


class PriceReferenceModel(Base):
    __tablename__ = "price_references"

    id = Column(Integer, primary_key=True, index=True)
    book_reference = Column(String(255), nullable=False, index=True)
    source = Column(String(50), nullable=False)
    external_price = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    confidence_score = Column(Float, nullable=False, default=1.0)
    observed_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class PricingDecisionModel(Base):
    __tablename__ = "pricing_decisions"

    id = Column(Integer, primary_key=True, index=True)
    book_reference = Column(String(255), nullable=False, index=True)
    suggested_price = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    explanation = Column(Text, nullable=False)
    condition_factor = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    reference_count = Column(Integer, nullable=False, default=0)
    adjustment_reasons = Column(Text, nullable=True)  # JSON-serialized list
    is_fallback = Column(Boolean, nullable=False, default=False)
    source = Column(String(50), nullable=False, default="internal_rules")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
