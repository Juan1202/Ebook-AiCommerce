import re
import unicodedata


def remove_control_characters(text: str) -> str:
    return "".join(
        ch for ch in text if not unicodedata.category(ch).startswith("C")
    )


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def remove_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def normalize_title(title: str | None) -> str | None:
    if not title:
        return None

    text = remove_control_characters(title)
    text = normalize_whitespace(text)
    text = remove_accents(text)

    return text.title() if text else None


def normalize_publisher(publisher: str | None) -> str | None:
    if not publisher:
        return None

    text = normalize_whitespace(publisher)
    text = remove_accents(text)

    return text if text else None
