import requests


def _safe(value):
    if value is None:
        return ""
    return str(value).strip()


def _google_cover(image_links: dict):
    if not image_links:
        return ""

    cover = (
        image_links.get("extraLarge")
        or image_links.get("large")
        or image_links.get("medium")
        or image_links.get("small")
        or image_links.get("thumbnail")
        or ""
    )

    return cover.replace("http://", "https://")


def google_books(isbn=None, title=None, author=None):
    queries = []

    if isbn:
        queries.append(f"isbn:{isbn}")

    if title:
        q = f'intitle:"{title}"'
        if author:
            q += f' inauthor:"{author}"'
        queries.append(q)

    for query in queries:
        try:
            response = requests.get(
                "https://www.googleapis.com/books/v1/volumes",
                params={"q": query, "maxResults": 1},
                timeout=10
            )

            if response.status_code != 200:
                continue

            data = response.json()

            if not data.get("items"):
                continue

            info = data["items"][0].get("volumeInfo", {})

            return {
                "source": "Google Books",
                "title": _safe(info.get("title")) or _safe(title),
                "author": ", ".join(info.get("authors", [])) or _safe(author) or "Autor no disponible",
                "publisher": _safe(info.get("publisher")) or None,
                "publication_year": _safe(info.get("publishedDate"))[:4] or None,
                "description": _safe(info.get("description")) or None,
                "cover": _google_cover(info.get("imageLinks", {})),
                "categories": info.get("categories", []),
                "language": _safe(info.get("language")) or None,
                "confidence": "HIGH" if isbn else "MEDIUM"
            }

        except Exception:
            continue

    return None


def open_library(isbn=None, title=None, author=None):
    try:
        if isbn:
            response = requests.get(
                f"https://openlibrary.org/isbn/{isbn}.json",
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()

                cover = ""
                covers = data.get("covers", [])

                if covers:
                    cover = f"https://covers.openlibrary.org/b/id/{covers[0]}-L.jpg"
                else:
                    cover = f"https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg?default=false"

                description = data.get("description")
                if isinstance(description, dict):
                    description = description.get("value")

                return {
                    "source": "Open Library",
                    "title": _safe(data.get("title")) or _safe(title),
                    "author": _safe(author) or "Autor no disponible",
                    "publisher": data.get("publishers", [None])[0] if data.get("publishers") else None,
                    "publication_year": _safe(data.get("publish_date"))[-4:] if data.get("publish_date") else None,
                    "description": _safe(description) or None,
                    "cover": cover,
                    "categories": data.get("subjects", []),
                    "language": None,
                    "confidence": "MEDIUM"
                }

        if title:
            response = requests.get(
                "https://openlibrary.org/search.json",
                params={
                    "title": title,
                    "author": author or "",
                    "limit": 1
                },
                timeout=10
            )

            if response.status_code != 200:
                return None

            data = response.json()
            docs = data.get("docs", [])

            if not docs:
                return None

            item = docs[0]

            cover = ""
            if item.get("cover_i"):
                cover = f"https://covers.openlibrary.org/b/id/{item.get('cover_i')}-L.jpg"

            return {
                "source": "Open Library",
                "title": _safe(item.get("title")) or _safe(title),
                "author": ", ".join(item.get("author_name", [])) or _safe(author) or "Autor no disponible",
                "publisher": item.get("publisher", [None])[0] if item.get("publisher") else None,
                "publication_year": item.get("first_publish_year"),
                "description": None,
                "cover": cover,
                "categories": item.get("subject", [])[:10] if item.get("subject") else [],
                "language": item.get("language", [None])[0] if item.get("language") else None,
                "confidence": "MEDIUM"
            }

    except Exception:
        return None

    return None


def crossref(title=None, author=None, isbn=None):
    if not title and not isbn:
        return None

    try:
        query = title or isbn

        if author:
            query = f"{query} {author}"

        response = requests.get(
            "https://api.crossref.org/works",
            params={
                "query.bibliographic": query,
                "rows": 1
            },
            timeout=10
        )

        if response.status_code != 200:
            return None

        data = response.json()
        items = data.get("message", {}).get("items", [])

        if not items:
            return None

        item = items[0]

        title_list = item.get("title", [])
        publisher = item.get("publisher")
        published = item.get("published-print") or item.get("published-online") or {}
        year_parts = published.get("date-parts", [])

        year = None
        if year_parts and year_parts[0]:
            year = year_parts[0][0]

        authors = []
        for person in item.get("author", []):
            given = person.get("given", "")
            family = person.get("family", "")
            full_name = f"{given} {family}".strip()
            if full_name:
                authors.append(full_name)

        return {
            "source": "Crossref",
            "title": _safe(title_list[0]) if title_list else _safe(title),
            "author": ", ".join(authors) or _safe(author) or "Autor no disponible",
            "publisher": _safe(publisher) or None,
            "publication_year": year,
            "description": None,
            "cover": "",
            "categories": ["Referencia bibliográfica"],
            "language": None,
            "confidence": "MEDIUM"
        }

    except Exception:
        return None