import json
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.domain.entities.pricing import PriceReference, PricingDecision
from app.domain.interfaces.pricing_repository import PricingRepositoryInterface
from app.infrastructure.database.models import PriceReferenceModel, PricingDecisionModel


class PricingRepository(PricingRepositoryInterface):
    def __init__(self, db: Session) -> None:
        self._db = db

    def save_reference(self, reference: PriceReference) -> PriceReference:
        model = PriceReferenceModel(
            book_reference=reference.book_reference,
            source=reference.source,
            external_price=reference.external_price,
            currency=reference.currency,
            confidence_score=reference.confidence_score,
            observed_at=reference.observed_at,
        )
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return self._to_reference_entity(model)

    def save_decision(self, decision: PricingDecision) -> PricingDecision:
        model = PricingDecisionModel(
            book_reference=decision.book_reference,
            suggested_price=decision.suggested_price,
            currency=decision.currency,
            explanation=decision.explanation,
            condition_factor=decision.condition_factor,
            base_price=decision.base_price,
            reference_count=decision.reference_count,
            adjustment_reasons=json.dumps(decision.adjustment_reasons),
            is_fallback=decision.is_fallback,
            source=decision.source,
            created_at=decision.created_at,
        )
        self._db.add(model)
        self._db.commit()
        self._db.refresh(model)
        return self._to_decision_entity(model)

    def get_latest_decision(self, book_reference: str) -> Optional[PricingDecision]:
        model = (
            self._db.query(PricingDecisionModel)
            .filter(PricingDecisionModel.book_reference == book_reference)
            .order_by(PricingDecisionModel.created_at.desc())
            .first()
        )
        return self._to_decision_entity(model) if model else None

    def get_decision_history(self, book_reference: str) -> list[PricingDecision]:
        models = (
            self._db.query(PricingDecisionModel)
            .filter(PricingDecisionModel.book_reference == book_reference)
            .order_by(PricingDecisionModel.created_at.desc())
            .all()
        )
        return [self._to_decision_entity(m) for m in models]

    def get_references_for_book(self, book_reference: str) -> list[PriceReference]:
        models = (
            self._db.query(PriceReferenceModel)
            .filter(PriceReferenceModel.book_reference == book_reference)
            .order_by(PriceReferenceModel.observed_at.desc())
            .all()
        )
        return [self._to_reference_entity(m) for m in models]

    @staticmethod
    def _to_reference_entity(model: PriceReferenceModel) -> PriceReference:
        return PriceReference(
            id=model.id,
            book_reference=model.book_reference,
            source=model.source,
            external_price=model.external_price,
            currency=model.currency,
            confidence_score=model.confidence_score,
            observed_at=model.observed_at,
        )

    @staticmethod
    def _to_decision_entity(model: PricingDecisionModel) -> PricingDecision:
        reasons = json.loads(model.adjustment_reasons) if model.adjustment_reasons else []
        return PricingDecision(
            id=model.id,
            book_reference=model.book_reference,
            suggested_price=model.suggested_price,
            currency=model.currency,
            explanation=model.explanation,
            condition_factor=model.condition_factor,
            base_price=model.base_price,
            reference_count=model.reference_count,
            adjustment_reasons=reasons,
            is_fallback=model.is_fallback,
            source=model.source,
            created_at=model.created_at,
        )
