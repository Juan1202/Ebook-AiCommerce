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
    if not isbn:
        return None

    try:
        response = requests.get(
            f"https://openlibrary.org/isbn/{isbn}.json",
            timeout=10
        )

        if response.status_code != 200:
            return None

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

    except Exception:
        return None