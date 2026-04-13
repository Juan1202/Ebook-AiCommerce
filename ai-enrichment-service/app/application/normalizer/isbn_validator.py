"""ISBN-10 to ISBN-13 conversion and validation."""


def validate_and_normalize(isbn: str) -> str | None:
    """Return ISBN-13 string or None if invalid."""
    cleaned = isbn.replace("-", "").replace(" ", "").strip()
    if len(cleaned) == 10:
        return _isbn10_to_isbn13(cleaned)
    if len(cleaned) == 13:
        return cleaned if _validate_isbn13(cleaned) else None
    return None


def _isbn10_to_isbn13(isbn10: str) -> str | None:
    if len(isbn10) != 10:
        return None
    digits = isbn10[:9]
    if not digits.isdigit():
        return None
    isbn13_without_check = "978" + digits
    check = _compute_isbn13_check(isbn13_without_check)
    return isbn13_without_check + str(check)


def _validate_isbn13(isbn13: str) -> bool:
    if len(isbn13) != 13 or not isbn13.isdigit():
        return False
    total = sum(
        int(d) * (1 if i % 2 == 0 else 3)
        for i, d in enumerate(isbn13)
    )
    return total % 10 == 0


def _compute_isbn13_check(isbn12: str) -> int:
    total = sum(
        int(d) * (1 if i % 2 == 0 else 3)
        for i, d in enumerate(isbn12)
    )
    remainder = total % 10
    return 0 if remainder == 0 else 10 - remainder
