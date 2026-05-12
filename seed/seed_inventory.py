"""Seed inventory items into inventory_db (matches the 20 catalog books)."""
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inventory-service"))

from app.infrastructure.database import Base, InventoryItemModel, ItemConditionDB  # noqa: E402

DATABASE_URL = os.getenv(
    "INVENTORY_DATABASE_URL",
    "postgresql://bookflow:bookflow123@localhost:5432/inventory_db",
)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)

_COND = {
    "NUEVO": ItemConditionDB.new,
    "BUENO": ItemConditionDB.good,
    "ACEPTABLE": ItemConditionDB.acceptable,
    "DETERIORADO": ItemConditionDB.poor,
}

ITEMS = [
    {"book_reference": "isbn:9780307474728", "title": "Cien años de soledad", "author": "García Márquez, Gabriel", "isbn": "9780307474728", "quantity_available": 5, "condition": "BUENO"},
    {"book_reference": "isbn:9780307389732", "title": "El amor en los tiempos del cólera", "author": "García Márquez, Gabriel", "isbn": "9780307389732", "quantity_available": 3, "condition": "BUENO"},
    {"book_reference": "isbn:9788408040088", "title": "Don Quijote de la Mancha", "author": "Cervantes, Miguel de", "isbn": "9788408040088", "quantity_available": 2, "condition": "ACEPTABLE"},
    {"book_reference": "isbn:9780451524935", "title": "1984", "author": "Orwell, George", "isbn": "9780451524935", "quantity_available": 7, "condition": "BUENO"},
    {"book_reference": "isbn:9781451673319", "title": "Fahrenheit 451", "author": "Bradbury, Ray", "isbn": "9781451673319", "quantity_available": 4, "condition": "NUEVO"},
    {"book_reference": "isbn:9780553380163", "title": "Una breve historia del tiempo", "author": "Hawking, Stephen", "isbn": "9780553380163", "quantity_available": 6, "condition": "BUENO"},
    {"book_reference": "isbn:9780198788607", "title": "El gen egoísta", "author": "Dawkins, Richard", "isbn": "9780198788607", "quantity_available": 2, "condition": "ACEPTABLE"},
    {"book_reference": "isbn:9780345331359", "title": "Cosmos", "author": "Sagan, Carl", "isbn": "9780345331359", "quantity_available": 3, "condition": "BUENO"},
    {"book_reference": "isbn:9780140432053", "title": "El origen de las especies", "author": "Darwin, Charles", "isbn": "9780140432053", "quantity_available": 1, "condition": "DETERIORADO"},
    {"book_reference": "isbn:9788499924212", "title": "Sapiens: De animales a dioses", "author": "Harari, Yuval Noah", "isbn": "9788499924212", "quantity_available": 10, "condition": "NUEVO"},
    {"book_reference": "isbn:9788499926643", "title": "Homo Deus", "author": "Harari, Yuval Noah", "isbn": "9788499926643", "quantity_available": 8, "condition": "NUEVO"},
    {"book_reference": "isbn:9780544176560", "title": "El nombre de la rosa", "author": "Eco, Umberto", "isbn": "9780544176560", "quantity_available": 4, "condition": "BUENO"},
    {"book_reference": "isbn:9780132350884", "title": "Clean Code", "author": "Martin, Robert C.", "isbn": "9780132350884", "quantity_available": 5, "condition": "BUENO"},
    {"book_reference": "isbn:9780201616224", "title": "The Pragmatic Programmer", "author": "Hunt, Andrew", "isbn": "9780201616224", "quantity_available": 2, "condition": "ACEPTABLE"},
    {"book_reference": "isbn:9780201633610", "title": "Design Patterns", "author": "Gamma, Erich", "isbn": "9780201633610", "quantity_available": 3, "condition": "BUENO"},
    {"book_reference": "isbn:9780262033848", "title": "Introduction to Algorithms", "author": "Cormen, Thomas H.", "isbn": "9780262033848", "quantity_available": 4, "condition": "NUEVO"},
    {"book_reference": "isbn:9788424912765", "title": "La república", "author": "Platón", "isbn": "9788424912765", "quantity_available": 3, "condition": "BUENO"},
    {"book_reference": "isbn:9788424908928", "title": "Meditaciones", "author": "Aurelio, Marco", "isbn": "9788424908928", "quantity_available": 2, "condition": "ACEPTABLE"},
    {"book_reference": "isbn:9788478443482", "title": "El mundo de Sofía", "author": "Gaarder, Jostein", "isbn": "9788478443482", "quantity_available": 6, "condition": "BUENO"},
    {"book_reference": "isbn:9788420629865", "title": "Así habló Zaratustra", "author": "Nietzsche, Friedrich", "isbn": "9788420629865", "quantity_available": 4, "condition": "BUENO"},
]


def run() -> None:
    session = Session()
    try:
        for item_data in ITEMS:
            condition_str = item_data.pop("condition")
            existing = session.query(InventoryItemModel).filter_by(
                book_reference=item_data["book_reference"]
            ).first()
            if not existing:
                item = InventoryItemModel(
                    **item_data,
                    condition=_COND[condition_str],
                )
                session.add(item)

        session.commit()
        print(f"Seeded {len(ITEMS)} inventory items.")
    except Exception as exc:
        session.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run()
