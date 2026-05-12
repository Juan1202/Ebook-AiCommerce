from app.domain.entities.interaction import AssistantInteraction
from app.domain.interfaces.interaction_repository import InteractionRepository
from app.infrastructure.clients.catalog_client import CatalogClient
from app.infrastructure.clients.inventory_client import InventoryClient
from app.infrastructure.clients.pricing_client import PricingClient

_ALTERNATIVES_KEYWORDS = (
    "alternativa", "alternativas", "similar", "similares", "parecido", "parecidos",
    "parecida", "parecidas", "otro como", "otros como", "algo como", "recomienda otro",
)
_CATALOG_KEYWORDS = (
    "busca", "encuentra", "libro", "libros", "título", "autor", "isbn", "buscar",
    "filosofía", "historia", "ciencia", "novela", "novelas", "clásic", "programación",
    "recomienda", "recomendar", "quiero", "muéstrame", "dame", "tienes", "muestra",
    "ficción", "poesía", "terror", "romance", "aventura", "infantil", "catalogo",
    "catálogo", "ver libros", "qué libros",
)
_PRICING_KEYWORDS = (
    "precio", "cuesta", "costo", "vale", "cost", "price",
    "barato", "baratos", "barata", "baratas", "económico", "económica",
    "cuánto", "cuanto", "caro", "caros",
)
_INVENTORY_KEYWORDS = (
    "disponible", "disponibles", "stock", "existe", "disponibilidad",
    "nuevo", "nuevos", "reciente", "recientes", "acaba de llegar",
    "hay en", "tienen en",
)

_FILLER_WORDS = frozenset({
    "busca", "buscar", "encuentra", "muéstrame", "muestra", "dame", "hay",
    "algo", "de", "un", "una", "unos", "unas", "el", "la", "los", "las",
    "cual", "cuál", "cuáles", "es", "son", "me", "que", "qué",
    "libro", "libros", "quiero", "ver", "tienes", "tienen", "quisiera",
    "necesito", "puedes", "puedo",
})

_PRICING_NOISE_WORDS = frozenset({
    "precio", "precios", "cuesta", "cuanto", "cuánto", "costo", "vale",
    "del", "barato", "economico", "económico", "económicos", "caro",
    "pagar", "comprar", "compra", "sale",
})

_QUANTITY_NOISE_WORDS = frozenset({
    "cuantas", "cuantos", "cuántas", "cuántos", "copias", "copia",
    "ejemplares", "ejemplar", "unidades", "unidad", "del",
})


def _detect_intent(question: str) -> str:
    lower = question.lower()
    if any(k in lower for k in _ALTERNATIVES_KEYWORDS):
        return "alternatives"
    if any(k in lower for k in _PRICING_KEYWORDS):
        return "pricing"
    if any(k in lower for k in _INVENTORY_KEYWORDS):
        return "inventory"
    if any(k in lower for k in _CATALOG_KEYWORDS):
        return "catalog"
    return "general"


def _extract_terms(question: str) -> str:
    words = question.lower().replace("?", "").replace("¿", "").split()
    meaningful = [w for w in words if w not in _FILLER_WORDS and len(w) > 2]
    return " ".join(meaningful)


def _fmt_price(price: float | int) -> str:
    if isinstance(price, float) and not price.is_integer():
        return f"${price:,.2f}"
    return f"${int(price):,}"


def _dedup_price_lines(priced: list[dict], limit: int) -> list[str]:
    seen: set[str] = set()
    lines = []
    for b in priced:
        key = b.get("title", "?")
        if key not in seen:
            seen.add(key)
            lines.append(f"- {key} ({b.get('author', '')}) — {_fmt_price(b['suggested_price'])}")
        if len(lines) >= limit:
            break
    return lines


def _fmt_book(b: dict) -> str:
    title = b.get("title", "Sin título")
    author = b.get("author", "")
    price = b.get("price")
    price_str = f" — {_fmt_price(price)}" if price is not None else ""
    return f"- {title} ({author}){price_str}"


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
        if intent == "alternatives":
            return self._answer_alternatives(question)
        if intent == "catalog":
            return self._answer_catalog(question)
        if intent == "pricing":
            return self._answer_pricing(question)
        if intent == "inventory":
            return self._answer_inventory(question)
        return (
            "Puedo ayudarte a buscar libros, consultar precios y verificar "
            "disponibilidad. ¿Qué necesitas?"
        )

    def _answer_catalog(self, question: str) -> str:
        terms = _extract_terms(question)
        searched = False
        if len(terms) >= 2:
            books = self._catalog.search_books(terms, limit=5)
            searched = True
        else:
            books = self._catalog.list_books(limit=5)

        if not books and searched:
            books = self._catalog.list_books(limit=5)
            if not books:
                return "No encontré libros en el catálogo en este momento."
            lines = [_fmt_book(b) for b in books[:5]]
            return f"No encontré libros de '{terms}', pero aquí hay algunos disponibles:\n" + "\n".join(lines)

        if not books:
            return "No encontré libros en el catálogo en este momento."

        lines = [_fmt_book(b) for b in books[:5]]
        header = f"Encontré {len(books)} libro(s):"
        return header + "\n" + "\n".join(lines)

    def _answer_pricing(self, question: str) -> str:
        lower = question.lower()
        wants_most_expensive = any(k in lower for k in ("más caro", "mas caro", "costoso", "el más", "el mas caro"))
        wants_cheapest = any(k in lower for k in ("barato", "baratos", "económico", "más barato", "mas barato", "más económico"))

        if wants_most_expensive or wants_cheapest:
            books = self._catalog.list_books(limit=20)
            priced = []
            for b in books:
                book_id = str(b.get("id", ""))
                if not book_id:
                    continue
                pd = self._pricing.get_price(book_id)
                sp = pd.get("suggested_price") if pd else None
                if sp is not None:
                    priced.append({**b, "suggested_price": sp})
            if not priced:
                return "No tengo precios calculados disponibles en este momento."
            if wants_most_expensive:
                priced.sort(key=lambda b: b["suggested_price"], reverse=True)
                lines = _dedup_price_lines(priced, 5)
                return "Los libros más caros son:\n" + "\n".join(lines)
            priced.sort(key=lambda b: b["suggested_price"])
            lines = _dedup_price_lines(priced, 5)
            return "Los libros más económicos son:\n" + "\n".join(lines)

        terms = _extract_terms(question)
        search_terms = " ".join(w for w in terms.split() if w not in _PRICING_NOISE_WORDS)
        books = self._catalog.search_books(search_terms, limit=3) if len(search_terms) >= 2 else []
        if not books:
            return "No encontré información de precios en este momento."

        book = books[0]
        book_id = str(book.get("id", ""))
        pd = self._pricing.get_price(book_id) if book_id else None
        price = pd.get("suggested_price") if pd else None
        title = book.get("title", "el libro")
        if price is None:
            return f"No tengo precio registrado para '{title}'."
        return f"El precio de '{title}' es {_fmt_price(price)}."

    def _answer_inventory(self, question: str) -> str:
        terms = _extract_terms(question)
        _availability_words = {"disponible", "disponibles", "stock", "disponibilidad",
                               "estan", "está", "esta", "nuevo", "nuevos", "reciente",
                               "recientes", "hay", "existe"}
        real_terms = [
            w for w in terms.split()
            if w not in _availability_words and w not in _QUANTITY_NOISE_WORDS
        ]

        if not real_terms:
            items = self._inventory.list_items(limit=50)
            available = [i for i in items if (i.get("quantity_available") or 0) > 0]
            if not available:
                return "No hay libros con stock disponible en este momento."
            seen: set[str] = set()
            unique = []
            for i in available:
                key = i.get("title", "?")
                if key not in seen:
                    seen.add(key)
                    unique.append(i)
            lines = [
                f"- {i.get('title', '?')} ({i.get('quantity_available', 0)} uds.)"
                for i in unique[:5]
            ]
            return f"Libros disponibles ({len(available)} encontrados):\n" + "\n".join(lines)

        search_q = " ".join(real_terms)
        books = self._catalog.search_books(search_q, limit=3)
        if not books:
            return "No encontré el libro. Intenta con el título o autor."
        book = books[0]
        title = book.get("title", "el libro")
        isbn_raw = (book.get("isbn") or "").replace("-", "")
        if not isbn_raw:
            return f"No tengo referencia de inventario para '{title}'."
        avail = self._inventory.get_availability(isbn_raw)
        if avail is None:
            return f"No tengo datos de stock para '{title}' en este momento."
        qty = avail.get("quantity_available") or 0
        status = "disponible" if qty > 0 else "sin stock"
        return f"'{title}' está {status} ({qty} unidades)."

    def _answer_alternatives(self, question: str) -> str:
        terms = _extract_terms(question)
        books = self._catalog.search_books(terms, limit=3) if len(terms) >= 2 else []
        if books:
            ref = books[0]
            category_id = ref.get("category_id")
            ref_author = ref.get("author", "")
            candidates = self._catalog.list_books(limit=20)
            similar = [
                b for b in candidates
                if b.get("id") != ref.get("id")
                and (b.get("category_id") == category_id or b.get("author") == ref_author)
            ]
            if similar:
                lines = [_fmt_book(b) for b in similar[:5]]
                return f"Alternativas a '{ref.get('title', '')}' que podrían interesarte:\n" + "\n".join(lines)
        books = self._catalog.list_books(limit=5)
        if not books:
            return "No encontré alternativas disponibles en este momento."
        lines = [_fmt_book(b) for b in books[:5]]
        return "Libros que podrían interesarte:\n" + "\n".join(lines)
