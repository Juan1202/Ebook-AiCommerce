import logging
import time
from dataclasses import dataclass
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class EbayPriceResult:
    price: float
    currency: str
    title: str
    confidence_score: float


class CircuitBreaker:
    MAX_FAILURES = 5
    COOLDOWN_SECONDS = 300

    def __init__(self) -> None:
        self._failures = 0
        self._opened_at: Optional[float] = None

    def is_open(self) -> bool:
        if self._opened_at is None:
            return False
        elapsed = time.time() - self._opened_at
        if elapsed >= self.COOLDOWN_SECONDS:
            self._failures = 0
            self._opened_at = None
            return False
        return True

    def record_failure(self) -> None:
        self._failures += 1
        if self._failures >= self.MAX_FAILURES:
            self._opened_at = time.time()
            logger.warning("eBay circuit breaker OPENED after %d failures", self._failures)

    def record_success(self) -> None:
        self._failures = 0
        self._opened_at = None

    def status(self) -> dict:
        return {
            "open": self.is_open(),
            "failures": self._failures,
            "cooldown_seconds": self.COOLDOWN_SECONDS,
        }


class SimpleCache:
    def __init__(self, ttl_seconds: int = 3600) -> None:
        self._store: dict[str, tuple[object, float]] = {}
        self._ttl = ttl_seconds

    def get(self, key: str) -> Optional[object]:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, timestamp = entry
        if time.time() - timestamp > self._ttl:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: object) -> None:
        self._store[key] = (value, time.time())


_circuit_breaker = CircuitBreaker()
_cache = SimpleCache(ttl_seconds=3600)


async def search_prices(isbn: str, title: Optional[str] = None) -> list[EbayPriceResult]:
    """Search eBay for price references for a book."""
    if _circuit_breaker.is_open():
        logger.warning("eBay circuit breaker is open; skipping call")
        return []

    query = isbn if isbn else title or ""
    cache_key = f"ebay:{query}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached  # type: ignore[return-value]

    if not settings.EBAY_APP_ID:
        logger.info("EBAY_APP_ID not configured; returning empty results")
        return []

    url = f"{settings.EBAY_BASE_URL}/item_summary/search"
    params = {
        "q": query,
        "category_ids": "267",  # Books & Magazines
        "limit": "10",
    }
    headers = {
        "Authorization": f"Bearer {settings.EBAY_APP_ID}",
        "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url, params=params, headers=headers)

        if response.status_code == 429:
            logger.warning("eBay rate limit hit (429)")
            _circuit_breaker.record_failure()
            return []

        if response.status_code == 404:
            _circuit_breaker.record_success()
            return []

        response.raise_for_status()
        data = response.json()
        results = _parse_ebay_response(data)
        _cache.set(cache_key, results)
        _circuit_breaker.record_success()
        return results

    except httpx.TimeoutException:
        logger.warning("eBay request timed out for query: %s", query)
        _circuit_breaker.record_failure()
        return []
    except Exception as exc:
        logger.error("eBay adapter error: %s", exc)
        _circuit_breaker.record_failure()
        return []


def _parse_ebay_response(data: dict) -> list[EbayPriceResult]:
    results = []
    items = data.get("itemSummaries", [])
    for item in items:
        price_info = item.get("price", {})
        try:
            price_value = float(price_info.get("value", 0))
            if price_value <= 0:
                continue
            results.append(
                EbayPriceResult(
                    price=price_value,
                    currency=price_info.get("currency", "USD"),
                    title=item.get("title", ""),
                    confidence_score=0.8,
                )
            )
        except (ValueError, TypeError):
            continue
    return results


def get_status() -> dict:
    return {"name": "ebay", **_circuit_breaker.status()}
