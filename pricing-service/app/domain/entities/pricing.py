from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class BookCondition(str, Enum):
    NUEVO = "NUEVO"
    BUENO = "BUENO"
    ACEPTABLE = "ACEPTABLE"
    DETERIORADO = "DETERIORADO"


CONDITION_FACTORS: dict[BookCondition, float] = {
    BookCondition.NUEVO: 1.0,
    BookCondition.BUENO: 0.75,
    BookCondition.ACEPTABLE: 0.50,
    BookCondition.DETERIORADO: 0.25,
}

MINIMUM_PRICE: float = 1.0
MAXIMUM_PRICE_MULTIPLIER: float = 3.0


@dataclass
class PriceReference:
    id: Optional[int]
    book_reference: str
    source: str
    external_price: float
    currency: str
    confidence_score: float
    observed_at: datetime


@dataclass
class PricingDecision:
    id: Optional[int]
    book_reference: str
    suggested_price: float
    currency: str
    explanation: str
    condition_factor: float
    base_price: float
    reference_count: int
    adjustment_reasons: list[str]
    is_fallback: bool
    source: str
    created_at: datetime = field(default_factory=datetime.utcnow)
