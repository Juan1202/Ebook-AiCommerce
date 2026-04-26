from datetime import datetime
from statistics import mean
from typing import List, Optional, Dict, Any
import logging

from sqlalchemy.orm import Session

from app.config import settings
from app.domain.pricing import PricingDecision, PricingReference, BookCondition
from app.infrastructure.pricing_repository import save_pricing_decision, get_latest_pricing_decision, get_pricing_history, get_pricing_decision_by_id
from app.infrastructure.adapters.ebay_adapter import EbayAdapter, MockEbayAdapter

logger = logging.getLogger(__name__)


class PricingService:
    def __init__(self, use_mock: bool = True):
        self.adapter = MockEbayAdapter() if use_mock else EbayAdapter()

    async def calculate_price(
        self,
        db: Session,
        book_id: str,
        book_title: str,
        condition: BookCondition,
        author: str = None
    ) -> PricingDecision:
        """Calculate suggested price for a book"""

        try:
            # Get external references
            references = await self.adapter.get_book_prices(book_title, author)
            source = "external"
            base_price = self._calculate_base_price(references)
            references_used = len(references)

        except Exception as e:
            logger.warning(f"External API failed: {e}. Using fallback.")
            # Fallback to internal logic
            references = []
            source = "fallback"
            base_price = self._fallback_base_price(book_title)
            references_used = 0

        # Apply condition factor
        condition_factor = settings.CONDITION_FACTORS.get(condition.value, 1.0)
        suggested_price = base_price * condition_factor

        # Apply minimum threshold
        if suggested_price < settings.MIN_PRICE_THRESHOLD:
            suggested_price = settings.MIN_PRICE_THRESHOLD

        # Create explanation
        explanation = self._build_explanation(
            base_price, condition_factor, suggested_price,
            references_used, source, condition
        )

        # Create decision
        decision = PricingDecision(
            id=None,
            book_id=book_id,
            condition=condition,
            base_price=base_price,
            condition_factor=condition_factor,
            suggested_price=suggested_price,
            references_used=references_used,
            source=source,
            explanation=explanation,
            created_at=datetime.utcnow(),
            references=references
        )

        # Save to database
        saved_decision = save_pricing_decision(db, decision)
        return saved_decision

    def _calculate_base_price(self, references: List[PricingReference]) -> float:
        """Calculate base price from references using median or mean"""
        if not references:
            return 10.0  # Default fallback

        prices = [ref.price for ref in references]
        # Use median to avoid outliers
        sorted_prices = sorted(prices)
        n = len(sorted_prices)
        if n % 2 == 0:
            base_price = (sorted_prices[n//2 - 1] + sorted_prices[n//2]) / 2
        else:
            base_price = sorted_prices[n//2]

        return round(base_price, 2)

    def _fallback_base_price(self, book_title: str) -> float:
        """Fallback pricing logic based on book title characteristics"""
        # Simple heuristic: longer titles might be more valuable
        title_length = len(book_title)
        base = 8.0 + (title_length * 0.1)
        return min(base, 25.0)  # Cap at 25

    def _build_explanation(
        self,
        base_price: float,
        condition_factor: float,
        suggested_price: float,
        references_used: int,
        source: str,
        condition: BookCondition
    ) -> str:
        """Build detailed explanation of pricing decision"""
        explanation = f"Precio base calculado: ${base_price:.2f} "

        if source == "external":
            explanation += f"basado en {references_used} referencias de eBay. "
        else:
            explanation += "usando lógica interna de fallback. "

        explanation += f"Factor de condición '{condition.value}': {condition_factor}. "
        explanation += f"Precio sugerido final: ${suggested_price:.2f}."

        if suggested_price == settings.MIN_PRICE_THRESHOLD:
            explanation += f" Aplicado umbral mínimo de ${settings.MIN_PRICE_THRESHOLD:.2f}."

        return explanation

    def get_latest_price(self, db: Session, book_id: str) -> Optional[PricingDecision]:
        """Get the latest pricing decision for a book"""
        return get_latest_pricing_decision(db, book_id)

    def get_price_history(self, db: Session, book_id: str) -> List[PricingDecision]:
        """Get pricing history for a book"""
        return get_pricing_history(db, book_id)

    def get_decision_explanation(self, db: Session, decision_id: int) -> Optional[str]:
        """Get explanation for a specific decision"""
        decision = get_pricing_decision_by_id(db, decision_id)
        return decision.explanation if decision else None

    def get_external_api_status(self) -> Dict[str, Any]:
        """Get status of external APIs"""
        return self.adapter.get_status()