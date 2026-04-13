"""Text normalization for titles and publishers."""
import re
import unicodedata


def normalize_title(title: str | None) -> str | None:
    if not title:
        return None
    # Remove control characters
    cleaned = "".join(ch for ch in title if not unicodedata.category(ch).startswith("C"))
    # Collapse whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    # Title case
    return cleaned.title() if cleaned else None


def normalize_publisher(publisher: str | None) -> str | None:
    if not publisher:
        return None
    cleaned = re.sub(r"\s+", " ", publisher).strip()
    return cleaned if cleaned else None
