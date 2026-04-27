import time
from typing import Optional


class CircuitBreaker:
    """Simple in-memory circuit breaker. Resets after cooldown_seconds."""

    MAX_FAILURES = 5
    COOLDOWN_SECONDS = 300  # 5 minutes

    def __init__(self, name: str):
        self.name = name
        self._failures = 0
        self._opened_at: Optional[float] = None

    def is_open(self) -> bool:
        if self._opened_at is None:
            return False
        if time.time() - self._opened_at >= self.COOLDOWN_SECONDS:
            self._reset()
            return False
        return True

    def record_failure(self) -> None:
        self._failures += 1
        if self._failures >= self.MAX_FAILURES:
            self._opened_at = time.time()

    def record_success(self) -> None:
        self._reset()

    def _reset(self) -> None:
        self._failures = 0
        self._opened_at = None


class SimpleCache:
    """In-memory TTL cache. Cleared on service restart."""

    def __init__(self, ttl_seconds: int = 3600):
        self._store: dict = {}
        self._ttl = ttl_seconds

    def get(self, key: str):
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value) -> None:
        self._store[key] = (value, time.time() + self._ttl)
