from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.domain.book import Book, Category
from app.infrastructure.database import BookModel, CategoryModel

_DEFAULT_CATEGORIES = [
    "Ficción", "No Ficción", "Ciencia", "Historia", "Filosofía",
    "Arte", "Tecnología", "Literatura Infantil", "Derecho", "Economía",
]


def _book(m: BookModel) -> Book:
    return Book(
        id=m.id,
        title=m.title,
        subtitle=m.subtitle,
        author=m.author,
        publisher=m.publisher,
        publication_year=m.publication_year,
        volume=m.volume,
        isbn=m.isbn,
        issn=m.issn,
        category_id=m.category_id,
        description=m.description,
        cover_url=m.cover_url,
        price=m.price,
        condition=m.condition,
        stock=m.stock,
        enriched_flag=m.enriched_flag,
        published_flag=m.published_flag,
        created_at=m.created_at,
        updated_at=m.updated_at,
    )


def _cat(m: CategoryModel) -> Category:
    return Category(id=m.id, name=m.name, description=m.description)


_DEFAULT_BOOKS = [
    {"title": "Cien Años de Soledad",                   "author": "Gabriel García Márquez",  "publisher": "Editorial Sudamericana", "isbn": "978-0-06-088328-7",  "category_name": "Ficción",     "price": 49000,  "description": "La obra maestra del realismo mágico latinoamericano.",             "cover_url": "https://images.cdn3.buscalibre.com/fit-in/360x360/61/8d/618d227e8967274cd9589a549adff52d.jpg"},
    {"title": "El Quijote",                              "author": "Miguel de Cervantes",     "publisher": "Cátedra",                "isbn": "978-84-376-0494-7",  "category_name": "Ficción",     "price": 41000,  "description": "La primera novela moderna de la literatura occidental.",            "cover_url": "https://images.cdn2.buscalibre.com/fit-in/360x360/73/b6/73b6fd96c31d26e2b6a3531808c1188c.jpg"},
    {"title": "1984",                                    "author": "George Orwell",           "publisher": "Secker & Warburg",       "isbn": "978-0-452-28423-4",  "category_name": "Ficción",     "price": 49000,  "description": "Una distopía sobre el totalitarismo y la vigilancia.",              "cover_url": "https://http2.mlstatic.com/D_NQ_NP_878597-MLA73472699954_122023-O.webp"},
    {"title": "Breve Historia del Tiempo",               "author": "Stephen Hawking",         "publisher": "Bantam Books",           "isbn": "978-0-553-38016-3",  "category_name": "Ciencia",     "price": 45000,  "description": "Cosmología para el gran público.",                                  "cover_url": "https://images.cdn2.buscalibre.com/fit-in/360x360/dc/b9/dcb9fcb5d04edddf0465a29ed4c6be6f.jpg"},
    {"title": "El Arte de la Guerra",                    "author": "Sun Tzu",                 "publisher": "Penguin",                "isbn": "978-0-14-044501-3",  "category_name": "Arte",        "price": 39900,  "description": "Tratado militar clásico de la China antigua.",                      "cover_url": "https://www.planetadelibros.com.co/usuaris/libros/fotos/375/original/374706_portada_el-arte-de-la-guerra_antonio-francisco-rodriguez-esteban_202310231102.jpg"},
    {"title": "El Aleph",                                "author": "Jorge Luis Borges",       "publisher": "Alianza",                "isbn": "978-84-206-3001-2",  "category_name": "Ficción",     "price": 36190,  "description": "Cuentos fantásticos y filosóficos del maestro argentino.",          "cover_url": "https://images.cdn3.buscalibre.com/fit-in/360x360/41/a6/41a665cae10e456979c5475375eb9f2d.jpg"},
    {"title": "Hábitos Atómicos",                        "author": "James Clear",             "publisher": "Diana Editorial",        "isbn": "978-84-1119-115-7",  "category_name": "No Ficción",  "price": 33900,  "description": "Cómo crear buenos hábitos y romper los malos.",                    "cover_url": "https://images.cdn1.buscalibre.com/fit-in/360x360/92/19/9219f95b47e9354ec97aa899104f705a.jpg"},
    {"title": "Cosmos",                                  "author": "Carl Sagan",              "publisher": "Editorial Planeta",      "isbn": "978-84-08-05304-0",  "category_name": "Ciencia",     "price": 199000, "description": "Una exploración del universo y nuestra posición en él.",           "cover_url": "https://images.cdn2.buscalibre.com/fit-in/520x520/b6/43/b64396bfa3dff8754439f8127768507c.jpg"},
    {"title": "Historia del Arte",                       "author": "E.H. Gombrich",           "publisher": "Alianza Editorial",      "isbn": "978-84-206-7005-8",  "category_name": "Arte",        "price": 44900,  "description": "El recorrido más completo por la historia del arte universal.",    "cover_url": "https://0.academia-photos.com/attachment_thumbnails/104392808/mini_magick20230720-1-qdg1s.png?1689830775"},
    {"title": "Sapiens: De animales a dioses",           "author": "Yuval Noah Harari",       "publisher": "Debate",                 "isbn": "978-84-9992-421-2",  "category_name": "Historia",    "price": 60000,  "description": "Historia del Homo sapiens y su dominio global.",                   "cover_url": "https://imagessl8.casadellibro.com/a/l/t5/18/9788466347518.jpg"},
    {"title": "Armas, gérmenes y acero",                 "author": "Jared Diamond",           "publisher": "Debate",                 "isbn": "978-84-8306-861-8",  "category_name": "Historia",    "price": 69000,  "description": "Por qué triunfan unas civilizaciones sobre otras.",                "cover_url": "https://images.cdn2.buscalibre.com/fit-in/360x360/dc/b9/dcb9fcb5d04edddf0465a29ed4c6be6f.jpg"},
    {"title": "El mundo de Sofía",                       "author": "Jostein Gaarder",         "publisher": "Siruela",                "isbn": "978-84-7844-815-9",  "category_name": "Filosofía",   "price": 56999,  "description": "Historia de la filosofía narrada como aventura.",                  "cover_url": "https://images.cdn3.buscalibre.com/fit-in/360x360/41/a6/41a665cae10e456979c5475375eb9f2d.jpg"},
    {"title": "Meditaciones",                            "author": "Marco Aurelio",           "publisher": "Editorial Reverté",      "isbn": "978-84-1012-115-7",  "category_name": "Filosofía",   "price": 39000,  "description": "Reflexiones estoicas del emperador romano.",                       "cover_url": "https://images.cdn1.buscalibre.com/fit-in/360x360/ac/43/ac43444704b60dea17e32e70b454b102.jpg"},
    {"title": "La era del capitalismo de la vigilancia", "author": "Shoshana Zuboff",         "publisher": "Paidós",                 "isbn": "978-84-493-3693-5",  "category_name": "Tecnología",  "price": 146150, "description": "Análisis del poder de las grandes tecnológicas.",                  "cover_url": "https://www.planetadelibros.com.mx/usuaris/libros/fotos/342/original/portada_la-era-del-capitalismo-de-la-vigilancia_shoshana-zuboff_202109032036.jpg"},
    {"title": "Padre Rico, Padre Pobre",                 "author": "Robert T. Kiyosaki",      "publisher": "Aguilar",                "isbn": "978-84-663-7300-5",  "category_name": "Economía",    "price": 69000,  "description": "Finanzas personales y educación financiera.",                      "cover_url": "https://m.media-amazon.com/images/I/81h9BBn4B4L._AC_UF1000,1000_QL80_.jpg"},
    {"title": "Pensar rápido, pensar despacio",          "author": "Daniel Kahneman",         "publisher": "Debate",                 "isbn": "978-84-9992-462-5",  "category_name": "Economía",    "price": 85000,  "description": "Psicología del pensamiento y la toma de decisiones.",              "cover_url": "https://images.cdn1.buscalibre.com/fit-in/360x360/ac/43/ac43444704b60dea17e32e70b454b102.jpg"},
]


def seed_categories(db: Session):
    for name in _DEFAULT_CATEGORIES:
        if not db.query(CategoryModel).filter(CategoryModel.name == name).first():
            db.add(CategoryModel(name=name))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


def seed_books(db: Session):
    if db.query(BookModel).count() > 0:
        return
    for data in _DEFAULT_BOOKS:
        cat = db.query(CategoryModel).filter(CategoryModel.name == data["category_name"]).first()
        db.add(BookModel(
            title=data["title"],
            author=data["author"],
            publisher=data["publisher"],
            isbn=data["isbn"],
            category_id=cat.id if cat else None,
            description=data["description"],
            cover_url=data["cover_url"],
            price=data.get("price"),
            published_flag=True,
            enriched_flag=False,
        ))
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise


def create_book(db: Session, book: Book) -> Book:
    m = BookModel(
        title=book.title,
        subtitle=book.subtitle,
        author=book.author,
        publisher=book.publisher,
        publication_year=book.publication_year,
        volume=book.volume,
        isbn=book.isbn,
        issn=book.issn,
        category_id=book.category_id,
        description=book.description,
        cover_url=book.cover_url,
        price=book.price,
        condition=book.condition,
        stock=book.stock,
        enriched_flag=book.enriched_flag,
        published_flag=book.published_flag,
    )

    db.add(m)
    try:
        db.commit()
        db.refresh(m)
    except IntegrityError:
        db.rollback()
        raise ValueError(f"Ya existe un libro con el ISBN {book.isbn}")
    except Exception:
        db.rollback()
        raise
    return _book(m)


def get_book(db: Session, book_id: int) -> Optional[Book]:
    m = db.query(BookModel).filter(BookModel.id == book_id).first()
    return _book(m) if m else None


def get_all_books(db: Session, skip: int, limit: int, published_only: bool) -> List[Book]:
    q = db.query(BookModel)
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
    try:
        db.commit()
        db.refresh(m)
    except Exception:
        db.rollback()
        raise
    return _book(m)


def delete_book(db: Session, book_id: int) -> bool:
    m = db.query(BookModel).filter(BookModel.id == book_id).first()
    if not m:
        return False
    db.delete(m)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
    return True


def get_all_categories(db: Session) -> List[Category]:
    return [_cat(m) for m in db.query(CategoryModel).all()]


def create_category(db: Session, name: str, description: str = None) -> Category:
    m = CategoryModel(name=name, description=description)
    db.add(m)
    try:
        db.commit()
        db.refresh(m)
    except Exception:
        db.rollback()
        raise
    return _cat(m)
