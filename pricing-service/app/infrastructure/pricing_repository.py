from typing import List, Optional
from sqlalchemy.orm import Session

from app.domain.pricing import PricingDecision, PricingReference, BookCondition
from app.infrastructure.database import PricingDecisionModel, PricingReferenceModel, BookConditionDB


def _reference_to_domain(model: PricingReferenceModel) -> PricingReference:
    return PricingReference(
        id=model.id,
        book_id=model.book_id,
        source=model.source,
        price=model.price,
        currency=model.currency,
        observed_at=model.observed_at,
        metadata=model.metadata or {}
    )


def _decision_to_domain(model: PricingDecisionModel) -> PricingDecision:
    return PricingDecision(
        id=model.id,
        book_id=model.book_id,
        condition=BookCondition(model.condition.value),
        base_price=model.base_price,
        condition_factor=model.condition_factor,
        suggested_price=model.suggested_price,
        references_used=model.references_used,
        source=model.source,
        explanation=model.explanation,
        created_at=model.created_at,
        references=[_reference_to_domain(ref) for ref in model.references] if model.references else []
    )


def save_pricing_decision(db: Session, decision: PricingDecision) -> PricingDecision:
    # Save references first
    reference_models = []
    for ref in decision.references or []:
        ref_model = PricingReferenceModel(
            book_id=ref.book_id,
            source=ref.source,
            price=ref.price,
            currency=ref.currency,
            observed_at=ref.observed_at,
            metadata=ref.metadata
        )
        db.add(ref_model)
        reference_models.append(ref_model)

    # Save decision
    decision_model = PricingDecisionModel(
        book_id=decision.book_id,
        condition=decision.condition.value,
        base_price=decision.base_price,
        condition_factor=decision.condition_factor,
        suggested_price=decision.suggested_price,
        references_used=decision.references_used,
        source=decision.source,
        explanation=decision.explanation
    )
    db.add(decision_model)
    db.commit()
    db.refresh(decision_model)
    return _decision_to_domain(decision_model)


def get_latest_pricing_decision(db: Session, book_id: str) -> Optional[PricingDecision]:
    model = db.query(PricingDecisionModel).filter(
        PricingDecisionModel.book_id == book_id
    ).order_by(PricingDecisionModel.created_at.desc()).first()
    return _decision_to_domain(model) if model else None


def get_pricing_history(db: Session, book_id: str) -> List[PricingDecision]:
    models = db.query(PricingDecisionModel).filter(
        PricingDecisionModel.book_id == book_id
    ).order_by(PricingDecisionModel.created_at.desc()).all()
    return [_decision_to_domain(model) for model in models]


def get_pricing_decision_by_id(db: Session, decision_id: int) -> Optional[PricingDecision]:
    model = db.query(PricingDecisionModel).filter(
        PricingDecisionModel.id == decision_id
    ).first()
    return _decision_to_domain(model) if model else None