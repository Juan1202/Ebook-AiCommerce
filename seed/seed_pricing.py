"""Seed pricing decisions and references into pricing_db (matches the 20 catalog books)."""
import datetime
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "pricing-service"))

from app.infrastructure.database import (  # noqa: E402
    Base,
    BookConditionDB,
    PricingDecisionModel,
    PricingReferenceModel,
)

DATABASE_URL = os.getenv(
    "PRICING_DATABASE_URL",
    "postgresql://bookflow:bookflow123@localhost:5432/pricing_db",
)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)

_CONDITION_FACTORS = {
    BookConditionDB.NUEVO: 1.0,
    BookConditionDB.BUENO: 0.75,
    BookConditionDB.ACEPTABLE: 0.50,
    BookConditionDB.DETERIORADO: 0.25,
}

DECISIONS = [
    {"book_id": "isbn:9780307474728", "book_title": "Cien años de soledad", "condition": BookConditionDB.BUENO, "base_price": 16.00, "references": [{"source": "ebay", "price": 15.50}, {"source": "ebay", "price": 16.50}]},
    {"book_id": "isbn:9780307389732", "book_title": "El amor en los tiempos del cólera", "condition": BookConditionDB.BUENO, "base_price": 12.00, "references": [{"source": "ebay", "price": 11.75}, {"source": "ebay", "price": 12.25}]},
    {"book_id": "isbn:9788408040088", "book_title": "Don Quijote de la Mancha", "condition": BookConditionDB.ACEPTABLE, "base_price": 20.00, "references": [{"source": "ebay", "price": 19.00}, {"source": "ebay", "price": 21.00}]},
    {"book_id": "isbn:9780451524935", "book_title": "1984", "condition": BookConditionDB.BUENO, "base_price": 10.67, "references": [{"source": "ebay", "price": 10.00}, {"source": "ebay", "price": 11.33}]},
    {"book_id": "isbn:9781451673319", "book_title": "Fahrenheit 451", "condition": BookConditionDB.NUEVO, "base_price": 12.67, "references": [{"source": "ebay", "price": 12.00}, {"source": "ebay", "price": 13.33}]},
    {"book_id": "isbn:9780553380163", "book_title": "Una breve historia del tiempo", "condition": BookConditionDB.BUENO, "base_price": 14.67, "references": [{"source": "ebay", "price": 14.00}, {"source": "ebay", "price": 15.33}]},
    {"book_id": "isbn:9780198788607", "book_title": "El gen egoísta", "condition": BookConditionDB.ACEPTABLE, "base_price": 9.33, "references": [{"source": "ebay", "price": 9.00}, {"source": "ebay", "price": 9.67}]},
    {"book_id": "isbn:9780345331359", "book_title": "Cosmos", "condition": BookConditionDB.BUENO, "base_price": 17.33, "references": [{"source": "ebay", "price": 17.00}, {"source": "ebay", "price": 17.67}]},
    {"book_id": "isbn:9780140432053", "book_title": "El origen de las especies", "condition": BookConditionDB.DETERIORADO, "base_price": 8.00, "references": [{"source": "internal_rules", "price": 8.00}]},
    {"book_id": "isbn:9788499924212", "book_title": "Sapiens: De animales a dioses", "condition": BookConditionDB.NUEVO, "base_price": 21.33, "references": [{"source": "ebay", "price": 20.00}, {"source": "ebay", "price": 22.67}]},
    {"book_id": "isbn:9788499926643", "book_title": "Homo Deus", "condition": BookConditionDB.NUEVO, "base_price": 20.00, "references": [{"source": "ebay", "price": 19.00}, {"source": "ebay", "price": 21.00}]},
    {"book_id": "isbn:9780544176560", "book_title": "El nombre de la rosa", "condition": BookConditionDB.BUENO, "base_price": 13.33, "references": [{"source": "ebay", "price": 13.00}, {"source": "ebay", "price": 13.67}]},
    {"book_id": "isbn:9780132350884", "book_title": "Clean Code", "condition": BookConditionDB.BUENO, "base_price": 29.33, "references": [{"source": "ebay", "price": 28.00}, {"source": "ebay", "price": 30.67}]},
    {"book_id": "isbn:9780201616224", "book_title": "The Pragmatic Programmer", "condition": BookConditionDB.ACEPTABLE, "base_price": 24.00, "references": [{"source": "ebay", "price": 23.00}, {"source": "ebay", "price": 25.00}]},
    {"book_id": "isbn:9780201633610", "book_title": "Design Patterns", "condition": BookConditionDB.BUENO, "base_price": 33.33, "references": [{"source": "ebay", "price": 32.00}, {"source": "ebay", "price": 34.67}]},
    {"book_id": "isbn:9780262033848", "book_title": "Introduction to Algorithms", "condition": BookConditionDB.NUEVO, "base_price": 40.00, "references": [{"source": "ebay", "price": 38.00}, {"source": "ebay", "price": 42.00}]},
    {"book_id": "isbn:9788424912765", "book_title": "La república", "condition": BookConditionDB.BUENO, "base_price": 12.00, "references": [{"source": "ebay", "price": 11.50}, {"source": "ebay", "price": 12.50}]},
    {"book_id": "isbn:9788424908928", "book_title": "Meditaciones", "condition": BookConditionDB.ACEPTABLE, "base_price": 10.67, "references": [{"source": "ebay", "price": 10.00}, {"source": "ebay", "price": 11.33}]},
    {"book_id": "isbn:9788478443482", "book_title": "El mundo de Sofía", "condition": BookConditionDB.BUENO, "base_price": 14.67, "references": [{"source": "ebay", "price": 14.00}, {"source": "ebay", "price": 15.33}]},
    {"book_id": "isbn:9788420629865", "book_title": "Así habló Zaratustra", "condition": BookConditionDB.BUENO, "base_price": 12.67, "references": [{"source": "ebay", "price": 12.00}, {"source": "ebay", "price": 13.33}]},
]


def _build_explanation(book_title: str, condition: BookConditionDB, refs: list[dict], base_price: float, suggested_price: float) -> str:
    ref_count = len(refs)
    source_names = list({r["source"] for r in refs})
    sources_str = ", ".join(source_names)
    factor = _CONDITION_FACTORS[condition]
    return (
        f"Precio calculado con base en {ref_count} referencia(s) de {sources_str} "
        f"(promedio base: ${base_price:.2f} USD). "
        f"Factor de condición {condition.value} aplicado ({factor:.2f}). "
        f"Precio sugerido final: ${suggested_price:.2f} USD."
    )


def run() -> None:
    session = Session()
    try:
        seeded = 0
        for d in DECISIONS:
            existing = session.query(PricingDecisionModel).filter_by(book_id=d["book_id"]).first()
            if existing:
                continue

            condition: BookConditionDB = d["condition"]
            factor = _CONDITION_FACTORS[condition]
            base_price: float = d["base_price"]
            suggested_price = round(base_price * factor, 2)
            refs: list[dict] = d["references"]
            source = refs[0]["source"] if refs else "internal_rules"

            explanation = _build_explanation(
                book_title=d["book_title"],
                condition=condition,
                refs=refs,
                base_price=base_price,
                suggested_price=suggested_price,
            )

            decision = PricingDecisionModel(
                book_id=d["book_id"],
                book_title=d["book_title"],
                condition=condition,
                base_price=base_price,
                condition_factor=factor,
                suggested_price=suggested_price,
                references_used=len(refs),
                source=source,
                explanation=explanation,
                created_at=datetime.datetime.now(datetime.timezone.utc),
            )
            session.add(decision)
            session.flush()

            for ref_data in refs:
                ref = PricingReferenceModel(
                    book_id=d["book_id"],
                    decision_id=decision.id,
                    source=ref_data["source"],
                    price=ref_data["price"],
                    currency="USD",
                    observed_at=datetime.datetime.now(datetime.timezone.utc),
                )
                session.add(ref)

            seeded += 1

        session.commit()
        print(f"Seeded {seeded} pricing decisions ({len(DECISIONS) - seeded} already existed).")
    except Exception as exc:
        session.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run()
