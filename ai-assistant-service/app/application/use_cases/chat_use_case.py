import re
import unicodedata
from difflib import SequenceMatcher
from typing import Any

from app.domain.entities.interaction import AssistantInteraction
from app.domain.interfaces.interaction_repository import InteractionRepository
from app.infrastructure.clients.catalog_client import CatalogClient
from app.infrastructure.clients.inventory_client import InventoryClient
from app.infrastructure.clients.pricing_client import PricingClient


_PRICE_WORDS = (
    "precio", "precios", "cuesta", "costo", "vale", "valor",
    "cuánto", "cuanto", "barato", "baratos", "caro", "caros"
)

_STOCK_WORDS = (
    "disponible", "disponibles", "disponibilidad", "stock",
    "hay", "tienen", "tienes", "unidades", "existencias"
)

_FEATURE_WORDS = (
    "características", "caracteristicas", "descripción", "descripcion",
    "autor", "editorial", "año", "isbn", "estado", "condición", "condicion"
)

_RECOMMEND_WORDS = (
    "recomienda", "recomendar", "recomiéndame", "recomiendame",
    "alternativa", "alternativas", "similar", "parecido", "sugerir",
    "sugerencias"
)

_LIST_WORDS = (
    "muéstrame", "muestrame", "mostrar", "lista", "listar",
    "qué libros", "que libros", "libros de", "libros sobre", "tienen libros",
    "libros nuevos", "nuevos libros", "novedades", "recientes", "esta semana"
)

_FILLER_WORDS = {
    "que", "qué", "cual", "cuál", "cuanto", "cuánto",
    "hay", "tienen", "tienes", "precio", "precios", "cuesta",
    "costo", "vale", "valor", "disponible", "disponibles",
    "disponibilidad", "stock", "caracteristicas", "características",
    "descripcion", "descripción", "del", "de", "la", "el", "los",
    "las", "un", "una", "unos", "unas", "libro", "libros",
    "por", "favor", "me", "puedes", "puede", "decir", "consultar",
    "buscar", "busca", "quiero", "necesito", "sobre", "y", "con",
    "para", "en", "al", "lo", "mi", "tu", "su", "se", "es",
    "son", "esta", "este", "estos", "estas", "muéstrame", "muestrame",
    "mostrar", "lista", "listar", "recomienda", "recomendar",
    "recomiéndame", "recomiendame"
}

_CATEGORY_SYNONYMS = {
    "novela": ["novela", "ficcion", "ficción", "literatura"],
    "ficcion": ["ficcion", "ficción", "novela", "literatura"],
    "ficción": ["ficción", "ficcion", "novela", "literatura"],
    "programacion": ["programacion", "programación", "tecnologia", "tecnología", "software", "codigo", "código"],
    "programación": ["programación", "programacion", "tecnologia", "tecnología", "software", "codigo", "código"],
    "tecnologia": ["tecnologia", "tecnología", "programacion", "programación", "software", "sistemas"],
    "tecnología": ["tecnología", "tecnologia", "programacion", "programación", "software", "sistemas"],
    "filosofia": ["filosofia", "filosofía"],
    "filosofía": ["filosofía", "filosofia"],
    "historia": ["historia"],
    "ciencia": ["ciencia"],
    "arte": ["arte"],
    "economia": ["economia", "economía"],
    "economía": ["economía", "economia"],
    "derecho": ["derecho"],
}


def _normalize(text: str | None) -> str:
    if not text:
        return ""

    text = text.lower().strip()
    text = text.replace("¿", "").replace("?", "")
    text = "".join(
        c for c in unicodedata.normalize("NFD", text)
        if unicodedata.category(c) != "Mn"
    )
    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _extract_terms(question: str) -> str:
    clean = _normalize(question)
    words = [
        w for w in clean.split()
        if w not in {_normalize(x) for x in _FILLER_WORDS} and len(w) > 1
    ]
    return " ".join(words).strip()


def _detect_intent(question: str) -> str:
    q = _normalize(question)

    wants_price = any(_normalize(w) in q for w in _PRICE_WORDS)
    wants_stock = any(_normalize(w) in q for w in _STOCK_WORDS)
    wants_features = any(_normalize(w) in q for w in _FEATURE_WORDS)
    wants_recommendation = any(_normalize(w) in q for w in _RECOMMEND_WORDS)
    wants_list = any(_normalize(w) in q for w in _LIST_WORDS)

    if "libros nuevos" in q or "nuevos libros" in q or "novedades" in q or "recientes" in q or "esta semana" in q:
        return "catalog_list"

    if wants_recommendation:
        return "recommendation"

    if wants_list and wants_stock:
        return "available_books"

    if wants_list and wants_price:
        return "priced_books"

    if wants_list:
        return "catalog_list"

    if sum([wants_price, wants_stock, wants_features]) >= 2:
        return "commercial_query"

    if wants_price:
        return "pricing"

    if wants_stock:
        return "inventory"

    if wants_features:
        return "catalog"

    return "catalog"


def _fmt_price(value: Any) -> str:
    if value in (None, "", [], {}):
        return "No registrado"

    try:
        return f"${float(value):,.0f} COP".replace(",", ".")
    except Exception:
        return str(value)


def _first_not_empty(*values: Any) -> Any:
    for value in values:
        if value not in (None, "", [], {}):
            return value
    return None


def _as_int(value: Any) -> int:
    try:
        if value in (None, "", [], {}):
            return 0
        return int(float(value))
    except Exception:
        return 0


def _field(book: dict, *names: str) -> Any:
    for name in names:
        if name in book and book.get(name) not in (None, "", [], {}):
            return book.get(name)
    return None


def _book_text(book: dict) -> str:
    values = [
        _field(book, "title", "name"),
        _field(book, "author", "authors"),
        _field(book, "category", "category_name", "genre"),
        _field(book, "publisher", "editorial"),
        _field(book, "isbn"),
        _field(book, "description", "summary"),
    ]
    return _normalize(" ".join(str(v) for v in values if v))


def _title(book: dict) -> str:
    return str(_field(book, "title", "name") or "Sin título")


def _author(book: dict) -> str:
    value = _field(book, "author", "authors")
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value or "Autor no registrado")


def _category(book: dict) -> str:
    return str(_field(book, "category", "category_name", "genre") or "Categoría no registrada")


def _year(book: dict) -> str:
    return str(_field(book, "publication_year", "year", "published_year") or "Año no registrado")


def _isbn(book: dict) -> str:
    return str(_field(book, "isbn", "ISBN") or "ISBN no registrado")


def _publisher(book: dict) -> str:
    return str(_field(book, "publisher", "editorial") or "Editorial no registrada")


def _description(book: dict) -> str:
    return str(_field(book, "description", "summary", "synopsis") or "Descripción no registrada")


def _condition(book: dict) -> str:
    return str(_field(book, "condition", "estado", "physical_condition") or "Condición no registrada")


def _local_quantity(book: dict) -> int:
    return _as_int(
        _field(
            book,
            "quantity_available",
            "available_quantity",
            "availability",
            "stock",
            "quantity",
            "available",
            "units",
        )
    )


def _local_price(book: dict) -> Any:
    return _field(
        book,
        "suggested_price",
        "price",
        "amount",
        "sale_price",
        "current_price",
        "precio",
    )


def _score_book(book: dict, terms: str) -> float:
    if not terms:
        return 0

    terms_norm = _normalize(terms)
    title_norm = _normalize(_title(book))
    author_norm = _normalize(_author(book))
    category_norm = _normalize(_category(book))
    isbn_norm = _normalize(_isbn(book))
    full_text = _book_text(book)

    score = 0.0

    if terms_norm == title_norm:
        score += 100

    if terms_norm in title_norm:
        score += 75

    if title_norm in terms_norm:
        score += 60

    for word in terms_norm.split():
        if word in title_norm:
            score += 15
        if word in author_norm:
            score += 8
        if word in category_norm:
            score += 8
        if word in isbn_norm:
            score += 20
        if word in full_text:
            score += 4

    score += SequenceMatcher(None, terms_norm, title_norm).ratio() * 35

    return score


def _category_terms_from_question(question: str) -> list[str]:
    q = _normalize(question)
    found: list[str] = []

    for key, values in _CATEGORY_SYNONYMS.items():
        key_norm = _normalize(key)
        if key_norm in q:
            found.extend([_normalize(v) for v in values])

    return list(dict.fromkeys(found))


class ChatUseCase:
    def __init__(
        self,
        repo: InteractionRepository,
        catalog: CatalogClient,
        pricing: PricingClient,
        inventory: InventoryClient,
    ) -> None:
        self._repo = repo
        self._catalog = catalog
        self._pricing = pricing
        self._inventory = inventory

    def execute(self, session_id: str, question: str) -> AssistantInteraction:
        intent = _detect_intent(question)
        answer = self._build_answer(intent, question)

        interaction = AssistantInteraction(
            session_id=session_id,
            user_question=question,
            interpreted_intent=intent,
            answer_text=answer,
        )
        return self._repo.save(interaction)

    def _build_answer(self, intent: str, question: str) -> str:
        if intent == "commercial_query":
            return self._answer_commercial_query(question)

        if intent == "pricing":
            return self._answer_pricing(question)

        if intent == "inventory":
            return self._answer_inventory(question)

        if intent == "available_books":
            return self._answer_available_books(question)

        if intent == "priced_books":
            return self._answer_priced_books(question)

        if intent == "catalog_list":
            return self._answer_catalog_list(question)

        if intent == "recommendation":
            return self._answer_recommendation(question)

        return self._answer_catalog(question)

    def _get_catalog_books(self, terms: str = "", limit: int = 30) -> list[dict]:
        books: list[dict] = []

        if terms:
            try:
                books = self._catalog.search_books(terms, limit=limit) or []
            except Exception:
                books = []

        if not books:
            try:
                books = self._catalog.list_books(limit=limit) or []
            except Exception:
                books = []

        return books

    def _find_books(self, question: str, limit: int = 5) -> list[dict]:
        terms = _extract_terms(question)
        category_terms = _category_terms_from_question(question)

        books = self._get_catalog_books(terms=terms, limit=max(limit, 40))

        if not books and category_terms:
            books = self._get_catalog_books(terms=category_terms[0], limit=max(limit, 40))

        if not books:
            return []

        if terms:
            books = sorted(
                books,
                key=lambda book: _score_book(book, terms),
                reverse=True,
            )

            scored = [book for book in books if _score_book(book, terms) >= 18]
            if scored:
                books = scored

        if category_terms:
            filtered = [
                book for book in books
                if any(term in _book_text(book) for term in category_terms)
            ]
            if filtered:
                books = filtered

        return books[:limit]

    def _get_quantity(self, book: dict) -> int:
        quantity = _local_quantity(book)

        if quantity > 0:
            return quantity

        book_id = str(_field(book, "id", "book_id") or "")
        isbn = str(_field(book, "isbn", "ISBN") or "").replace("-", "").strip()

        availability = None

        if isbn:
            try:
                availability = self._inventory.get_availability(isbn)
            except Exception:
                availability = None

        if not availability and book_id:
            try:
                availability = self._inventory.get_availability(book_id)
            except Exception:
                availability = None

        if availability:
            quantity = _as_int(
                _field(
                    availability,
                    "quantity_available",
                    "available_quantity",
                    "stock",
                    "quantity",
                    "available",
                    "units",
                )
            )

        return quantity

    def _get_price(self, book: dict) -> Any:
        local_price = _local_price(book)

        if local_price not in (None, "", [], {}):
            return local_price

        book_id = str(_field(book, "id", "book_id") or "")

        if not book_id:
            return None

        try:
            price_data = self._pricing.get_price(book_id)
        except Exception:
            price_data = None

        if not price_data:
            return None

        return _first_not_empty(
            price_data.get("suggested_price"),
            price_data.get("price"),
            price_data.get("amount"),
            price_data.get("sale_price"),
            price_data.get("current_price"),
        )

    def _answer_commercial_query(self, question: str) -> str:
        books = self._find_books(question, limit=3)

        if not books:
            return (
                "No encontré un libro relacionado con tu consulta en el catálogo real. "
                "Para evitar inventar información, intenta escribir el título, autor o ISBN exacto."
            )

        book = books[0]

        quantity = self._get_quantity(book)
        price = self._get_price(book)

        stock_text = (
            f"Disponible ({quantity} unidad(es))"
            if quantity > 0
            else "Sin stock registrado o no disponible"
        )

        return (
            f"Encontré información real del sistema para '{_title(book)}'.\n\n"
            f"Disponibilidad: {stock_text}.\n"
            f"Precio sugerido: {_fmt_price(price)}.\n"
            f"Autor: {_author(book)}.\n"
            f"Editorial: {_publisher(book)}.\n"
            f"Año: {_year(book)}.\n"
            f"ISBN: {_isbn(book)}.\n"
            f"Categoría: {_category(book)}.\n"
            f"Condición: {_condition(book)}.\n"
            f"Descripción: {_description(book)}\n\n"
            f"No inventé datos: si algún campo aparece como no registrado, significa que no está disponible en los servicios actuales."
        )

    def _answer_pricing(self, question: str) -> str:
        books = self._find_books(question, limit=5)

        if not books:
            return "No encontré ese libro en el catálogo real, por eso no puedo consultar un precio."

        book = books[0]
        price = self._get_price(book)

        if price in (None, "", [], {}):
            return (
                f"No tengo precio calculado para '{_title(book)}'. "
                f"En el catálogo aparece como: Precio a consultar."
            )

        return f"El precio sugerido de '{_title(book)}' es {_fmt_price(price)}."

    def _answer_inventory(self, question: str) -> str:
        books = self._find_books(question, limit=5)

        if not books:
            return "No encontré ese libro en el catálogo real, por eso no puedo verificar disponibilidad."

        book = books[0]
        quantity = self._get_quantity(book)

        if quantity > 0:
            return f"'{_title(book)}' está disponible. Hay {quantity} unidad(es) registradas."

        return f"'{_title(book)}' aparece sin stock disponible en inventario."

    def _answer_catalog(self, question: str) -> str:
        books = self._find_books(question, limit=5)

        if not books:
            return (
                "No encontré libros relacionados en el catálogo real. "
                "Intenta escribir el título, autor, ISBN o una categoría."
            )

        if len(books) == 1:
            book = books[0]
            return (
                f"Encontré este libro en el catálogo:\n"
                f"- {_title(book)} — {_author(book)} ({_year(book)})\n"
                f"Categoría: {_category(book)}.\n"
                f"ISBN: {_isbn(book)}."
            )

        lines = []
        for book in books[:5]:
            lines.append(f"- {_title(book)} — {_author(book)} ({_year(book)})")

        return "Encontré estos libros en el catálogo:\n" + "\n".join(lines)

    def _answer_available_books(self, question: str) -> str:
        books = self._find_books(question, limit=20)

        available = []
        for book in books:
            quantity = self._get_quantity(book)
            if quantity > 0:
                available.append((book, quantity))

        if not available:
            return (
                "No encontré libros con stock disponible para esa consulta. "
                "Puede que el catálogo tenga libros, pero sin disponibilidad registrada."
            )

        lines = []
        for book, quantity in available[:5]:
            lines.append(f"- {_title(book)} — {_author(book)}: {quantity} unidad(es)")

        return "Estos libros aparecen con stock disponible:\n" + "\n".join(lines)

    def _answer_priced_books(self, question: str) -> str:
        books = self._find_books(question, limit=20)

        priced = []
        for book in books:
            price = self._get_price(book)
            if price not in (None, "", [], {}):
                priced.append((book, price))

        if not priced:
            return (
                "No encontré libros con precio registrado para esa consulta. "
                "En este momento varios productos pueden aparecer como 'Precio a consultar'."
            )

        lines = []
        for book, price in priced[:5]:
            lines.append(f"- {_title(book)} — {_fmt_price(price)}")

        return "Estos libros tienen precio registrado:\n" + "\n".join(lines)

    def _answer_catalog_list(self, question: str) -> str:
        books = self._find_books(question, limit=5)

        if not books:
            return (
                "No encontré libros relacionados con esa consulta. "
                "Intenta con una categoría como tecnología, ficción, historia o filosofía."
            )

        lines = []
        for book in books:
            quantity = self._get_quantity(book)
            stock_text = f"{quantity} unidad(es)" if quantity > 0 else "sin stock registrado"
            lines.append(f"- {_title(book)} — {_author(book)} ({stock_text})")

        return "Encontré estos libros en el catálogo real:\n" + "\n".join(lines)

    def _answer_recommendation(self, question: str) -> str:
        books = self._find_books(question, limit=10)

        if not books:
            return "No encontré recomendaciones disponibles en el catálogo real en este momento."

        available_books = []
        fallback_books = []

        for book in books:
            quantity = self._get_quantity(book)
            if quantity > 0:
                available_books.append((book, quantity))
            else:
                fallback_books.append(book)

        if available_books:
            lines = []
            for book, quantity in available_books[:5]:
                lines.append(f"- {_title(book)} — {_author(book)}: {quantity} unidad(es)")
            return "Te recomiendo estas opciones con stock disponible:\n" + "\n".join(lines)

        lines = []
        for book in fallback_books[:5]:
            lines.append(f"- {_title(book)} — {_author(book)}")

        return (
            "Encontré estas opciones en el catálogo, pero no tienen stock registrado:\n"
            + "\n".join(lines)
        )