from __future__ import annotations

import logging
from dataclasses import dataclass

from app.domain.entities.order import (IllegalStateTransitionError, Order,
                                       OrderStatus)
from app.domain.interfaces.inventory_client import InventoryClient
from app.domain.interfaces.order_repository import OrderRepository

logger = logging.getLogger(__name__)


class OrderNotFoundError(LookupError):
    def __init__(self, order_id: int) -> None:
        super().__init__(f"order {order_id} not found")
        self.order_id = order_id


@dataclass(frozen=True)
class InsufficientStockLine:
    book_id: str
    requested: int
    available: int


class InsufficientStockError(RuntimeError):
    def __init__(self, shortages: tuple[InsufficientStockLine, ...]) -> None:
        details = ", ".join(
            f"{s.book_id} (need {s.requested}, have {s.available})" for s in shortages
        )
        super().__init__(f"insufficient stock: {details}")
        self.shortages = shortages


class ConfirmOrderUseCase:
    """Transition a PENDING order to CONFIRMED only when inventory-service
    reports enough stock for every line. No partial confirmations."""

    def __init__(
        self,
        repository: OrderRepository,
        inventory_client: InventoryClient,
    ) -> None:
        self._repository = repository
        self._inventory_client = inventory_client

    async def execute(self, order_id: int) -> Order:
        order = self._repository.get_by_id(order_id)
        if order is None:
            raise OrderNotFoundError(order_id)

        if order.status is not OrderStatus.PENDING:
            raise IllegalStateTransitionError(
                f"Order {order_id} is {order.status.value}, can only confirm PENDING"
            )

        shortages: list[InsufficientStockLine] = []
        for item in order.items:
            level = await self._inventory_client.get_stock(item.book_id)
            if level.available < item.quantity:
                shortages.append(
                    InsufficientStockLine(
                        book_id=item.book_id,
                        requested=item.quantity,
                        available=level.available,
                    )
                )
        if shortages:
            raise InsufficientStockError(tuple(shortages))

        confirmed = order.transition_to(OrderStatus.CONFIRMED)
        return self._repository.update(confirmed)
