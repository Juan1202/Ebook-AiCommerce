"""Seed 20 books into catalog_db (categories + books)."""
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "catalog-service"))

from app.infrastructure.database import Base, CategoryModel, BookModel  # noqa: E402

DATABASE_URL = os.getenv(
    "CATALOG_DATABASE_URL",
    "postgresql://bookflow:bookflow123@localhost:5432/catalog_db",
)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)


CATEGORIES = [
    {"name": "Literatura", "description": "Novelas, cuentos y poesía"},
    {"name": "Ciencia", "description": "Física, química, biología"},
    {"name": "Historia", "description": "Historia universal y regional"},
    {"name": "Programación", "description": "Software, algoritmos, ingeniería"},
    {"name": "Filosofía", "description": "Ética, lógica, metafísica"},
]

BOOKS = [
    {"title": "Cien años de soledad", "author": "García Márquez, Gabriel", "publisher": "Sudamericana", "publication_year": 1967, "isbn": "9780307474728", "category": "Literatura", "condition": "BUENO", "stock": 5, "price": 1200},
    {"title": "El amor en los tiempos del cólera", "author": "García Márquez, Gabriel", "publisher": "Oveja Negra", "publication_year": 1985, "isbn": "9780307389732", "category": "Literatura", "condition": "BUENO", "stock": 3, "price": 900},
    {"title": "Don Quijote de la Mancha", "author": "Cervantes, Miguel de", "publisher": "Planeta", "publication_year": 1605, "isbn": "9788408040088", "category": "Literatura", "condition": "ACEPTABLE", "stock": 2, "price": 1500},
    {"title": "1984", "author": "Orwell, George", "publisher": "Secker & Warburg", "publication_year": 1949, "isbn": "9780451524935", "category": "Literatura", "condition": "BUENO", "stock": 7, "price": 800},
    {"title": "Fahrenheit 451", "author": "Bradbury, Ray", "publisher": "Ballantine Books", "publication_year": 1953, "isbn": "9781451673319", "category": "Literatura", "condition": "NUEVO", "stock": 4, "price": 950},
    {"title": "Una breve historia del tiempo", "author": "Hawking, Stephen", "publisher": "Bantam Books", "publication_year": 1988, "isbn": "9780553380163", "category": "Ciencia", "condition": "BUENO", "stock": 6, "price": 1100},
    {"title": "El gen egoísta", "author": "Dawkins, Richard", "publisher": "Oxford University Press", "publication_year": 1976, "isbn": "9780198788607", "category": "Ciencia", "condition": "ACEPTABLE", "stock": 2, "price": 700},
    {"title": "Cosmos", "author": "Sagan, Carl", "publisher": "Random House", "publication_year": 1980, "isbn": "9780345331359", "category": "Ciencia", "condition": "BUENO", "stock": 3, "price": 1300},
    {"title": "El origen de las especies", "author": "Darwin, Charles", "publisher": "John Murray", "publication_year": 1859, "isbn": "9780140432053", "category": "Ciencia", "condition": "DETERIORADO", "stock": 1, "price": 600},
    {"title": "Sapiens: De animales a dioses", "author": "Harari, Yuval Noah", "publisher": "Debate", "publication_year": 2011, "isbn": "9788499924212", "category": "Historia", "condition": "NUEVO", "stock": 10, "price": 1600},
    {"title": "Homo Deus", "author": "Harari, Yuval Noah", "publisher": "Debate", "publication_year": 2015, "isbn": "9788499926643", "category": "Historia", "condition": "NUEVO", "stock": 8, "price": 1500},
    {"title": "El nombre de la rosa", "author": "Eco, Umberto", "publisher": "Lumen", "publication_year": 1980, "isbn": "9780544176560", "category": "Literatura", "condition": "BUENO", "stock": 4, "price": 1000},
    {"title": "Clean Code", "author": "Martin, Robert C.", "publisher": "Prentice Hall", "publication_year": 2008, "isbn": "9780132350884", "category": "Programación", "condition": "BUENO", "stock": 5, "price": 2200},
    {"title": "The Pragmatic Programmer", "author": "Hunt, Andrew; Thomas, David", "publisher": "Addison-Wesley", "publication_year": 1999, "isbn": "9780201616224", "category": "Programación", "condition": "ACEPTABLE", "stock": 2, "price": 1800},
    {"title": "Design Patterns", "author": "Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John", "publisher": "Addison-Wesley", "publication_year": 1994, "isbn": "9780201633610", "category": "Programación", "condition": "BUENO", "stock": 3, "price": 2500},
    {"title": "Introduction to Algorithms", "author": "Cormen, Thomas H.", "publisher": "MIT Press", "publication_year": 2009, "isbn": "9780262033848", "category": "Programación", "condition": "NUEVO", "stock": 4, "price": 3000},
    {"title": "La república", "author": "Platón", "publisher": "Gredos", "publication_year": -380, "isbn": "9788424912765", "category": "Filosofía", "condition": "BUENO", "stock": 3, "price": 900},
    {"title": "Meditaciones", "author": "Aurelio, Marco", "publisher": "Gredos", "publication_year": 180, "isbn": "9788424908928", "category": "Filosofía", "condition": "ACEPTABLE", "stock": 2, "price": 800},
    {"title": "El mundo de Sofía", "author": "Gaarder, Jostein", "publisher": "Siruela", "publication_year": 1991, "isbn": "9788478443482", "category": "Filosofía", "condition": "BUENO", "stock": 6, "price": 1100},
    {"title": "Así habló Zaratustra", "author": "Nietzsche, Friedrich", "publisher": "Alianza Editorial", "publication_year": 1883, "isbn": "9788420629865", "category": "Filosofía", "condition": "BUENO", "stock": 4, "price": 950},
]


def run() -> None:
    session = Session()
    try:
        cat_map: dict[str, int] = {}
        for cat_data in CATEGORIES:
            existing = session.query(CategoryModel).filter_by(name=cat_data["name"]).first()
            if not existing:
                cat = CategoryModel(**cat_data)
                session.add(cat)
                session.flush()
                cat_map[cat_data["name"]] = cat.id
            else:
                cat_map[cat_data["name"]] = existing.id

        for book_data in BOOKS:
            cat_name = book_data.pop("category")
            existing = session.query(BookModel).filter_by(isbn=book_data.get("isbn")).first()
            if not existing:
                book = BookModel(
                    **book_data,
                    category_id=cat_map.get(cat_name),
                    published_flag=True,
                )
                session.add(book)

        session.commit()
        print(f"Seeded {len(BOOKS)} books and {len(CATEGORIES)} categories.")
    except Exception as exc:
        session.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run()
