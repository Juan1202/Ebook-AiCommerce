from abc import ABC, abstractmethod
from typing import Optional

from app.domain.entities.pricing import PriceReference, PricingDecision


class PricingRepositoryInterface(ABC):
    @abstractmethod
    def save_reference(self, reference: PriceReference) -> PriceReference:
        ...

    @abstractmethod
    def save_decision(self, decision: PricingDecision) -> PricingDecision:
        ...

    @abstractmethod
    def get_latest_decision(self, book_reference: str) -> Optional[PricingDecision]:
        ...

    @abstractmethod
    def get_decision_history(self, book_reference: str) -> list[PricingDecision]:
        ...

    @abstractmethod
    def get_references_for_book(self, book_reference: str) -> list[PriceReference]:
        ...
