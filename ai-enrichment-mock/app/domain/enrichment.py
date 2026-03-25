from dataclasses import dataclass, field
from typing import Optional

_PUBLISHERS = ["Penguin Random House", "Editorial Planeta", "Alfaguara",
               "Anagrama", "Seix Barral", "Tusquets", "Destino", "Siruela"]
_CATEGORIES = ["Ficción", "No Ficción", "Ciencia", "Historia",
               "Filosofía", "Tecnología", "Arte", "Economía"]


@dataclass
class EnrichmentRequest:
    book_reference: str
    title: str
    author: str
    isbn: Optional[str] = None
    issn: Optional[str] = None


@dataclass
class EnrichmentResult:
    book_reference: str
    normalized_title: str
    normalized_author: str
    normalized_publisher: str
    normalized_description: str
    cover_url: str
    publication_year: int
    category_suggestion: str
    source_used: str
    confidence_score: float
    metadata: dict


def build_mock_result(req: EnrichmentRequest) -> EnrichmentResult:
    import hashlib
    seed = int(hashlib.md5(req.book_reference.encode()).hexdigest()[:8], 16)
    publisher = _PUBLISHERS[seed % len(_PUBLISHERS)]
    category = _CATEGORIES[seed % len(_CATEGORIES)]
    year = 1980 + (seed % 44)
    score = round(0.65 + (seed % 35) / 100, 2)
    title_slug = req.title[:15].replace(" ", "+")
    return EnrichmentResult(
        book_reference=req.book_reference,
        normalized_title=req.title.strip().title(),
        normalized_author=req.author.strip().title(),
        normalized_publisher=publisher,
        normalized_description=(
            f"Descripción enriquecida de '{req.title}' por {req.author}. "
            f"Publicado por {publisher} ({year}). "
            f"Una obra destacada en la categoría {category}."
        ),
        cover_url=f"https://via.placeholder.com/200x300/4A90E2/FFFFFF?text={title_slug}",
        publication_year=year,
        category_suggestion=category,
        source_used="mock_google_books",
        confidence_score=score,
        metadata={
            "isbn_verified": bool(req.isbn),
            "sources_consulted": ["mock_google_books", "mock_open_library"],
            "sprint": "1 — mock data",
        },
    )
