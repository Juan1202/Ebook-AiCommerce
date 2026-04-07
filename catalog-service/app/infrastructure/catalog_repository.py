from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.domain.book import Book, Category
from app.infrastructure.database import BookModel, CategoryModel

_DEFAULT_CATEGORIES = [
    "Ficción", "No Ficción", "Ciencia", "Historia", "Filosofía",
    "Arte", "Tecnología", "Literatura Infantil", "Derecho", "Economía",
]


def _book(m: BookModel) -> Book:
    return Book(
        id=m.id, title=m.title, subtitle=m.subtitle, author=m.author,
        publisher=m.publisher, publication_year=m.publication_year, volume=m.volume,
        isbn=m.isbn, issn=m.issn, category_id=m.category_id, description=m.description,
        cover_url=m.cover_url, enriched_flag=m.enriched_flag, published_flag=m.published_flag,
        created_at=m.created_at, updated_at=m.updated_at,
    )


def _cat(m: CategoryModel) -> Category:
    return Category(id=m.id, name=m.name, description=m.description)


def seed_categories(db: Session):
    for name in _DEFAULT_CATEGORIES:
        if not db.query(CategoryModel).filter(CategoryModel.name == name).first():
            db.add(CategoryModel(name=name))
    db.commit()


def create_book(db: Session, book: Book) -> Book:
    m = BookModel(
        title=book.title, subtitle=book.subtitle, author=book.author,
        publisher=book.publisher, publication_year=book.publication_year, volume=book.volume,
        isbn=book.isbn, issn=book.issn, category_id=book.category_id,
        description=book.description, cover_url=book.cover_url,
        enriched_flag=book.enriched_flag, published_flag=book.published_flag,
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return _book(m)


def get_book(db: Session, book_id: int) -> Optional[Book]:
    m = db.query(BookModel).filter(BookModel.id == book_id).first()
    return _book(m) if m else None


def get_all_books(db: Session, skip: int, limit: int, published_only: bool) -> List[Book]:
    q = db.query(BookModel).order_by(BookModel.id.desc())
    if published_only:
        q = q.filter(BookModel.published_flag == True)
    return [_book(m) for m in q.offset(skip).limit(limit).all()]


def search_books(db: Session, query: str, skip: int, limit: int) -> List[Book]:
    return [_book(m) for m in db.query(BookModel).filter(
        or_(BookModel.title.ilike(f"%{query}%"),
            BookModel.author.ilike(f"%{query}%"),
            BookModel.isbn.ilike(f"%{query}%"))
    ).offset(skip).limit(limit).all()]


def update_book(db: Session, book_id: int, **kwargs) -> Optional[Book]:
    m = db.query(BookModel).filter(BookModel.id == book_id).first()
    if not m:
        return None
    for k, v in kwargs.items():
        if hasattr(m, k):
            setattr(m, k, v)
    db.commit()
    db.refresh(m)
    return _book(m)


def delete_book(db: Session, book_id: int) -> bool:
    m = db.query(BookModel).filter(BookModel.id == book_id).first()
    if not m:
        return False
    db.delete(m)
    db.commit()
    return True


def get_all_categories(db: Session) -> List[Category]:
    return [_cat(m) for m in db.query(CategoryModel).all()]


def create_category(db: Session, name: str, description: str = None) -> Category:
    m = CategoryModel(name=name, description=description)
    db.add(m)
    db.commit()
    db.refresh(m)
    return _cat(m)
