from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class StockLevel:
    book_id: str
    available: int


class InventoryClient(Protocol):
    """Port for stock availability checks. Implementation calls
    inventory-service over REST."""

    async def get_stock(self, book_id: str) -> StockLevel: ...
