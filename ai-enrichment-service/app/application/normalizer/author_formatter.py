"""Author name formatting: 'First Last' → 'Last, First'"""
import re


def format_author(author: str | None) -> str | None:
    if not author:
        return None

    # Handle multiple authors separated by ";" or ","
    separators = re.split(r"\s*;\s*", author.strip())
    formatted = [_format_single(a.strip()) for a in separators if a.strip()]
    return "; ".join(formatted) if formatted else None


def _format_single(name: str) -> str:
    # Already in "Last, First" format
    if "," in name:
        return name.strip()

    parts = name.split()
    if len(parts) == 1:
        return parts[0]
    if len(parts) == 2:
        return f"{parts[-1]}, {parts[0]}"

    # Multiple name parts: last word is surname
    surname = parts[-1]
    given = " ".join(parts[:-1])
    return f"{surname}, {given}"
