import io

import pandas as pd
from sqlalchemy.orm import Session

from app.domain.inventory_item import (
    BatchStatus, ImportBatch, ImportError, InventoryItem, ItemCondition,
)
from app.infrastructure import inventory_repository

REQUIRED_COLUMNS = {"title", "book_reference", "quantity_available"}

# Mapeo de cabeceras en español (Dataset_Bookflow) a nombres internos
_COLUMN_ALIASES: dict[str, str] = {
    "título_del_libro": "title",
    "titulo_del_libro": "title",
    "isbn_13": "book_reference",
    "isbn_10": "external_code",
    "estado_del_libro": "condition",
    "caracteristicas": "defects",
    "comentarios_opcionales": "observations",
    "unidades_disponibles": "quantity_available",
    "ubicación_física_en_bodega": "location",
    "ubicacion_fisica_en_bodega": "location",
    "url_portada": "cover_url",
}


def process_inventory_file(db: Session, file_name: str,
                            content: bytes, extension: str) -> ImportBatch:
    batch = inventory_repository.create_batch(db, file_name)

    try:
        if extension in ("xlsx", "xls"):
            df = pd.read_excel(io.BytesIO(content))
        elif extension == "csv":
            for enc in ("utf-8-sig", "utf-8", "latin-1", "cp1252"):
                try:
                    df = pd.read_csv(io.StringIO(content.decode(enc)))
                    break
                except UnicodeDecodeError:
                    continue
            else:
                df = pd.read_csv(io.StringIO(content.decode("utf-8", errors="replace")))
        else:
            inventory_repository.update_batch(db, batch.id, 0, 0, 0, "failed")
            raise ValueError(f"Formato no soportado: {extension}")
    except Exception:
        inventory_repository.update_batch(db, batch.id, 0, 0, 0, "failed")
        raise

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    df.rename(columns=_COLUMN_ALIASES, inplace=True)
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        inventory_repository.update_batch(db, batch.id, 0, 0, 0, "failed")
        raise ValueError(f"Columnas requeridas faltantes: {missing}")

    processed = valid = invalid = 0

    for idx, row in df.iterrows():
        row_num = idx + 2
        processed += 1
        raw = str(row.to_dict())

        try:
            qty = int(row.get("quantity_available", 0))
        except (ValueError, TypeError):
            qty = -1

        cond_raw = str(row.get("condition", "good")).strip().lower()
        try:
            condition = ItemCondition(cond_raw)
        except ValueError:
            condition = ItemCondition.GOOD

        book_ref = str(row.get("book_reference", "")).strip()
        if not book_ref:
            book_ref = str(row.get("external_code", "")).strip()

        item = InventoryItem(
            id=None,
            external_code=str(row.get("external_code", "")).strip() or None,
            book_reference=book_ref,
            title=str(row.get("title", "")).strip(),
            isbn=str(row.get("isbn", book_ref)).strip() or None,
            quantity_available=qty,
            quantity_reserved=0,
            condition=condition,
            author=str(row.get("author", "")).strip() or "",
            defects=[],
            observations=str(row.get("observations", "")).strip() or None,
            import_batch_id=batch.id,
            created_at=None,
        )

        errors = item.validate()
        if errors:
            invalid += 1
            for msg in errors:
                inventory_repository.create_error(db, ImportError(
                    id=None, batch_id=batch.id, row_number=row_num,
                    error_type="validation_error", message=msg, raw_data=raw,
                ))
        else:
            inventory_repository.create_item(db, item)
            valid += 1

    status = "completed" if valid > 0 else "failed"
    return inventory_repository.update_batch(db, batch.id, processed, valid, invalid, status)


def get_all_items(db: Session, skip: int = 0, limit: int = 100):
    return inventory_repository.get_all_items(db, skip, limit)


def get_item(db: Session, item_id: int):
    return inventory_repository.get_item_by_id(db, item_id)


def get_all_batches(db: Session):
    return inventory_repository.get_all_batches(db)


def get_batch(db: Session, batch_id: int):
    return inventory_repository.get_batch_by_id(db, batch_id)


def get_batch_errors(db: Session, batch_id: int):
    return inventory_repository.get_errors_by_batch(db, batch_id)


def get_batch_items(db: Session, batch_id: int):
    return inventory_repository.get_items_by_batch(db, batch_id)


def check_availability(db: Session, book_reference: str) -> int:
    return inventory_repository.check_availability(db, book_reference)


def reserve_stock(db: Session, book_reference: str, quantity: int) -> bool:
    return inventory_repository.reserve_stock(db, book_reference, quantity)
