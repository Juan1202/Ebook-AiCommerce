from app.config import settings
from app.domain.entities.recommendation import RecommendedBook
from app.domain.strategies.author_similarity import AuthorSimilarityStrategy
from app.domain.strategies.category_similarity import CategorySimilarityStrategy
from app.infrastructure.clients.catalog_client import CatalogClient


class RecommendUseCase:
    def __init__(self, catalog: CatalogClient) -> None:
        self._catalog = catalog
        self._strategies = [
            AuthorSimilarityStrategy(),
            CategorySimilarityStrategy(),
        ]

    async def execute(self, book_id: str) -> list[RecommendedBook]:
        book = self._catalog.get_book(book_id)
        if not book:
            return []

        all_books = self._catalog.list_books(limit=200)

        seen_ids: set[str] = set()
        results: list[RecommendedBook] = []

        for strategy in self._strategies:
            candidates = await strategy.recommend(book, all_books)
            for candidate in candidates:
                if candidate.book_id not in seen_ids:
                    seen_ids.add(candidate.book_id)
                    results.append(candidate)

        results.sort(key=lambda r: r.score, reverse=True)
        return results[: settings.MAX_RECOMMENDATIONS]
