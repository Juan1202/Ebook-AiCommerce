from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.domain.inventory_item import (
    BatchStatus, ImportBatch, ImportError, InventoryItem, ItemCondition,
)
from app.infrastructure.database import (
    BatchStatusDB, ImportBatchModel, ImportErrorModel,
    InventoryItemModel, ItemConditionDB,
)


def _item(m: InventoryItemModel) -> InventoryItem:
    return InventoryItem(
        id=m.id, external_code=m.external_code, book_reference=m.book_reference,
        title=m.title, author=m.author, isbn=m.isbn,
        quantity_available=m.quantity_available, quantity_reserved=m.quantity_reserved,
        condition=ItemCondition(m.condition.value), defects=m.defects,
        observations=m.observations, import_batch_id=m.import_batch_id, created_at=m.created_at,
    )


def _batch(m: ImportBatchModel) -> ImportBatch:
    return ImportBatch(
        id=m.id, file_name=m.file_name, upload_date=m.upload_date,
        processed_rows=m.processed_rows, valid_rows=m.valid_rows,
        invalid_rows=m.invalid_rows, status=BatchStatus(m.status.value),
    )


def _error(m: ImportErrorModel) -> ImportError:
    return ImportError(
        id=m.id, batch_id=m.batch_id, row_number=m.row_number,
        error_type=m.error_type, message=m.message, raw_data=m.raw_data,
    )


def create_batch(db: Session, file_name: str) -> ImportBatch:
    m = ImportBatchModel(file_name=file_name, status=BatchStatusDB.processing)
    db.add(m)
    db.commit()
    db.refresh(m)
    return _batch(m)


def update_batch(db: Session, batch_id: int, processed: int, valid: int,
                 invalid: int, status: str) -> ImportBatch:
    m = db.query(ImportBatchModel).filter(ImportBatchModel.id == batch_id).first()
    m.processed_rows = processed
    m.valid_rows = valid
    m.invalid_rows = invalid
    m.status = BatchStatusDB(status)
    db.commit()
    db.refresh(m)
    return _batch(m)


def create_item(db: Session, item: InventoryItem) -> InventoryItem:
    m = InventoryItemModel(
        external_code=item.external_code, book_reference=item.book_reference,
        title=item.title, author=item.author, isbn=item.isbn,
        quantity_available=item.quantity_available, quantity_reserved=0,
        condition=ItemConditionDB(item.condition.value),
        defects=item.defects, observations=item.observations,
        import_batch_id=item.import_batch_id,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return _item(m)


def create_error(db: Session, err: ImportError):
    m = ImportErrorModel(
        batch_id=err.batch_id, row_number=err.row_number,
        error_type=err.error_type, message=err.message, raw_data=err.raw_data,
    )
    db.add(m)
    db.commit()


def get_all_items(db: Session, skip: int = 0, limit: int = 100) -> List[InventoryItem]:
    return [_item(m) for m in db.query(InventoryItemModel).offset(skip).limit(limit).all()]


def get_item_by_id(db: Session, item_id: int) -> Optional[InventoryItem]:
    m = db.query(InventoryItemModel).filter(InventoryItemModel.id == item_id).first()
    return _item(m) if m else None


def get_all_batches(db: Session) -> List[ImportBatch]:
    return [_batch(m) for m in db.query(ImportBatchModel).order_by(ImportBatchModel.id.desc()).all()]


def get_batch_by_id(db: Session, batch_id: int) -> Optional[ImportBatch]:
    m = db.query(ImportBatchModel).filter(ImportBatchModel.id == batch_id).first()
    return _batch(m) if m else None


def get_errors_by_batch(db: Session, batch_id: int) -> List[ImportError]:
    return [_error(m) for m in db.query(ImportErrorModel).filter(
        ImportErrorModel.batch_id == batch_id).all()]


def get_items_by_batch(db: Session, batch_id: int) -> List[InventoryItem]:
    return [_item(m) for m in db.query(InventoryItemModel).filter(
        InventoryItemModel.import_batch_id == batch_id).all()]


def check_availability(db: Session, book_reference: str) -> int:
    result = db.query(func.sum(InventoryItemModel.quantity_available)).filter(
        InventoryItemModel.book_reference == book_reference
    ).scalar()
    return result or 0
