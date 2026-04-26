import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import httpx
from cachetools import TTLCache
from circuitbreaker import circuit

from app.config import settings
from app.domain.pricing import PricingReference


class ExternalAPIStatus:
    def __init__(self):
        self.last_check = datetime.utcnow()
        self.is_available = True
        self.error_message = None

    def update_status(self, available: bool, error: str = None):
        self.last_check = datetime.utcnow()
        self.is_available = available
        self.error_message = error


class EbayAdapter:
    def __init__(self):
        self.cache = TTLCache(maxsize=100, ttl=settings.CACHE_TTL)
        self.status = ExternalAPIStatus()
        self.client = httpx.AsyncClient(timeout=10.0)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()

    @circuit(failure_threshold=settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
             recovery_timeout=settings.CIRCUIT_BREAKER_RECOVERY_TIMEOUT)
    async def get_book_prices(self, book_title: str, author: str = None) -> List[PricingReference]:
        """Get pricing references from eBay API"""
        cache_key = f"{book_title}_{author or ''}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        try:
            # Build search query
            query = f'"{book_title}"'
            if author:
                query += f' "{author}"'

            params = {
                'q': query,
                'category_ids': '267',  # Books category
                'limit': '20',
                'sort': 'price'
            }

            headers = {
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                'X-EBAY-C-ENDUSERCTX': f'affiliateCampaignId={settings.EBAY_APP_ID}'
            }

            response = await self.client.get(
                settings.EBAY_API_URL,
                params=params,
                headers=headers
            )
            response.raise_for_status()

            data = response.json()
            references = self._parse_ebay_response(data, book_title)
            self.cache[cache_key] = references
            self.status.update_status(True)
            return references

        except Exception as e:
            self.status.update_status(False, str(e))
            raise

    def _parse_ebay_response(self, data: Dict[str, Any], book_title: str) -> List[PricingReference]:
        """Parse eBay API response into PricingReference objects"""
        references = []

        if 'itemSummaries' not in data:
            return references

        for item in data['itemSummaries'][:10]:  # Limit to 10 references
            try:
                price_info = item.get('price', {})
                if not price_info:
                    continue

                # Extract price
                value = price_info.get('value')
                currency = price_info.get('currency', 'USD')

                if not value:
                    continue

                price = float(value)

                # Create reference
                reference = PricingReference(
                    id=None,
                    book_id=book_title,  # Using title as book_id for simplicity
                    source="eBay",
                    price=price,
                    currency=currency,
                    observed_at=datetime.utcnow(),
                    metadata={
                        'item_id': item.get('itemId'),
                        'title': item.get('title'),
                        'condition': item.get('condition'),
                        'seller': item.get('seller', {}).get('username'),
                        'url': item.get('itemWebUrl')
                    }
                )
                references.append(reference)

            except (ValueError, KeyError):
                continue

        return references

    def get_status(self) -> Dict[str, Any]:
        """Get current status of eBay API"""
        return {
            'source': 'eBay',
            'available': self.status.is_available,
            'last_check': self.status.last_check.isoformat(),
            'error_message': self.status.error_message
        }


# For testing/development, create a mock adapter
class MockEbayAdapter(EbayAdapter):
    async def get_book_prices(self, book_title: str, author: str = None) -> List[PricingReference]:
        """Mock implementation for testing"""
        cache_key = f"{book_title}_{author or ''}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        # Simulate some delay
        await asyncio.sleep(0.1)

        # Mock data
        mock_prices = [15.99, 12.50, 18.75, 10.00, 22.99]
        references = []

        for i, price in enumerate(mock_prices):
            reference = PricingReference(
                id=None,
                book_id=book_title,
                source="eBay",
                price=price,
                currency="USD",
                observed_at=datetime.utcnow(),
                metadata={
                    'item_id': f'mock_{i}',
                    'title': f"{book_title} - Copy {i+1}",
                    'condition': 'Used' if i % 2 == 0 else 'New',
                    'seller': f'seller_{i}',
                    'url': f'https://ebay.com/item/mock_{i}'
                }
            )
            references.append(reference)

        self.cache[cache_key] = references
        self.status.update_status(True)
        return references
