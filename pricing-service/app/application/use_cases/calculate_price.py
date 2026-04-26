import logging
from datetime import datetime
from typing import Optional

from app.domain.entities.pricing import (
    CONDITION_FACTORS,
    MINIMUM_PRICE,
    MAXIMUM_PRICE_MULTIPLIER,
    BookCondition,
    PriceReference,
    PricingDecision,
)
from app.domain.interfaces.pricing_repository import PricingRepositoryInterface
from app.infrastructure.adapters import ebay_adapter

logger = logging.getLogger(__name__)

CURRENT_YEAR = 2026
NEW_BOOK_YEARS = 2
BACKLIST_YEARS = 10
BACKLIST_ADJUSTMENT = 1.10  # +10% for out-of-print books


class CalculatePriceUseCase:
    def __init__(self, repo: PricingRepositoryInterface) -> None:
        self._repo = repo

    async def execute(
        self,
        book_id: str,
        isbn: Optional[str],
        title: Optional[str],
        condition: BookCondition,
        publication_year: Optional[int],
    ) -> dict:
        condition_factor = CONDITION_FACTORS[condition]
        adjustment_reasons: list[str] = []
        is_fallback = False
        source = "ebay"

        # Fetch eBay references
        ebay_results = await ebay_adapter.search_prices(isbn or "", title)
        references: list[PriceReference] = []

        for item in ebay_results:
            ref = PriceReference(
                id=None,
                book_reference=book_id,
                source="ebay",
                external_price=item.price,
                currency=item.currency,
                confidence_score=item.confidence_score,
                observed_at=datetime.utcnow(),
            )
            saved_ref = self._repo.save_reference(ref)
            references.append(saved_ref)

        if references:
            avg_price = sum(r.external_price for r in references) / len(references)
            base_price = avg_price
        else:
            # Fallback: internal rules
            is_fallback = True
            source = "internal_rules"
            base_price = self._internal_base_price(publication_year)
            adjustment_reasons.append("No external references found; applied internal rules")

        # Apply backlist / new-book adjustment
        if publication_year:
            age = CURRENT_YEAR - publication_year
            if age > BACKLIST_YEARS:
                base_price *= BACKLIST_ADJUSTMENT
                adjustment_reasons.append(
                    f"Backlist adjustment +10% (published {publication_year}, {age} years ago)"
                )

        # Apply condition factor
        raw_price = base_price * condition_factor

        # Enforce minimum price
        if raw_price < MINIMUM_PRICE:
            raw_price = MINIMUM_PRICE
            adjustment_reasons.append(f"Minimum price floor applied (${MINIMUM_PRICE:.2f})")

        # Enforce maximum price cap if references exist
        if references:
            avg_ref = sum(r.external_price for r in references) / len(references)
            max_allowed = avg_ref * MAXIMUM_PRICE_MULTIPLIER
            if raw_price > max_allowed:
                raw_price = max_allowed
                adjustment_reasons.append(
                    f"Maximum price cap applied (3x reference average ${avg_ref:.2f})"
                )

        suggested_price = round(raw_price, 2)
        explanation = self._build_explanation(
            references, base_price, condition, condition_factor,
            suggested_price, adjustment_reasons, is_fallback,
        )

        decision = PricingDecision(
            id=None,
            book_reference=book_id,
            suggested_price=suggested_price,
            currency="USD",
            explanation=explanation,
            condition_factor=condition_factor,
            base_price=round(base_price, 2),
            reference_count=len(references),
            adjustment_reasons=adjustment_reasons,
            is_fallback=is_fallback,
            source=source,
            created_at=datetime.utcnow(),
        )
        saved = self._repo.save_decision(decision)

        return {
            "book_id": book_id,
            "suggested_price": saved.suggested_price,
            "currency": saved.currency,
            "explanation": saved.explanation,
            "source": saved.source,
            "condition_factor": saved.condition_factor,
            "base_price": saved.base_price,
            "references_found": saved.reference_count,
            "is_fallback": saved.is_fallback,
            "calculated_at": saved.created_at.isoformat(),
        }

    @staticmethod
    def _internal_base_price(publication_year: Optional[int]) -> float:
        if publication_year is None:
            return 15.0
        age = CURRENT_YEAR - publication_year
        if age <= NEW_BOOK_YEARS:
            return 20.0  # Recent release
        if age <= BACKLIST_YEARS:
            return 12.0  # Mid-age
        return 8.0  # Older / backlist

    @staticmethod
    def _build_explanation(
        references: list[PriceReference],
        base_price: float,
        condition: BookCondition,
        condition_factor: float,
        suggested_price: float,
        adjustment_reasons: list[str],
        is_fallback: bool,
    ) -> str:
        parts: list[str] = []

        if references:
            avg = sum(r.external_price for r in references) / len(references)
            parts.append(
                f"Precio calculado con base en {len(references)} referencias de eBay "
                f"(promedio: ${avg:.2f})."
            )
        else:
            parts.append("No se encontraron referencias externas; se aplicaron reglas internas.")

        parts.append(
            f"Factor de condición {condition.value} aplicado ({condition_factor}). "
            f"Precio base: ${base_price:.2f}."
        )

        for reason in adjustment_reasons:
            parts.append(reason + ".")

        parts.append(f"Precio final sugerido: ${suggested_price:.2f}.")

        if is_fallback:
            parts.append("ESTIMADO — precio calculado sin referencias externas.")

        return " ".join(parts)
