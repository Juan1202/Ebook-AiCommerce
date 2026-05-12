"""Seed enrichment requests and results into enrichment_db (matches the 20 catalog books)."""
import datetime
import os
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ai-enrichment-service"))

from app.infrastructure.database.connection import Base  # noqa: E402
from app.infrastructure.database.models import (  # noqa: E402
    EnrichmentRequestModel,
    EnrichmentResultModel,
    EnrichmentStatusDB,
)

DATABASE_URL = os.getenv(
    "ENRICHMENT_DATABASE_URL",
    "postgresql://bookflow:bookflow123@localhost:5432/enrichment_db",
)

engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)

ENRICHMENTS = [
    {
        "book_id": "isbn:9780307474728",
        "isbn": "9780307474728",
        "title": "Cien años de soledad",
        "author": "García Márquez, Gabriel",
        "publisher": "Sudamericana",
        "source_used": "google_books",
        "normalized_title": "Cien Años de Soledad",
        "normalized_author": "García Márquez, Gabriel",
        "normalized_publisher": "Editorial Sudamericana",
        "normalized_description": "Novela cumbre del realismo mágico latinoamericano narrada por siete generaciones de la familia Buendía.",
        "cover_url": "https://books.google.com/books/content?id=cien-anos&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.95,
    },
    {
        "book_id": "isbn:9780307389732",
        "isbn": "9780307389732",
        "title": "El amor en los tiempos del cólera",
        "author": "García Márquez, Gabriel",
        "publisher": "Oveja Negra",
        "source_used": "google_books",
        "normalized_title": "El Amor en los Tiempos del Cólera",
        "normalized_author": "García Márquez, Gabriel",
        "normalized_publisher": "Editorial Oveja Negra",
        "normalized_description": "Historia de amor que transcurre a lo largo de más de medio siglo en una ciudad del Caribe colombiano.",
        "cover_url": "https://books.google.com/books/content?id=amor-colera&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.92,
    },
    {
        "book_id": "isbn:9788408040088",
        "isbn": "9788408040088",
        "title": "Don Quijote de la Mancha",
        "author": "Cervantes, Miguel de",
        "publisher": "Planeta",
        "source_used": "open_library",
        "normalized_title": "Don Quijote de la Mancha",
        "normalized_author": "Cervantes Saavedra, Miguel de",
        "normalized_publisher": "Editorial Planeta",
        "normalized_description": "Obra cumbre de la literatura española; relata las aventuras del ingenioso hidalgo Alonso Quijano.",
        "cover_url": "https://covers.openlibrary.org/b/isbn/9788408040088-L.jpg",
        "confidence_score": 0.98,
    },
    {
        "book_id": "isbn:9780451524935",
        "isbn": "9780451524935",
        "title": "1984",
        "author": "Orwell, George",
        "publisher": "Secker & Warburg",
        "source_used": "google_books",
        "normalized_title": "1984",
        "normalized_author": "Orwell, George",
        "normalized_publisher": "Secker & Warburg",
        "normalized_description": "Novela distópica que retrata una sociedad totalitaria bajo la vigilancia permanente del Gran Hermano.",
        "cover_url": "https://books.google.com/books/content?id=1984-orwell&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.97,
    },
    {
        "book_id": "isbn:9781451673319",
        "isbn": "9781451673319",
        "title": "Fahrenheit 451",
        "author": "Bradbury, Ray",
        "publisher": "Ballantine Books",
        "source_used": "google_books",
        "normalized_title": "Fahrenheit 451",
        "normalized_author": "Bradbury, Ray",
        "normalized_publisher": "Ballantine Books",
        "normalized_description": "Novela de ciencia ficción que describe un futuro donde los libros están prohibidos y los bomberos los queman.",
        "cover_url": "https://books.google.com/books/content?id=f451&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.96,
    },
    {
        "book_id": "isbn:9780553380163",
        "isbn": "9780553380163",
        "title": "Una breve historia del tiempo",
        "author": "Hawking, Stephen",
        "publisher": "Bantam Books",
        "source_used": "google_books",
        "normalized_title": "Una Breve Historia del Tiempo",
        "normalized_author": "Hawking, Stephen",
        "normalized_publisher": "Bantam Books",
        "normalized_description": "Divulgación científica sobre cosmología, el origen del universo, agujeros negros y la naturaleza del tiempo.",
        "cover_url": "https://books.google.com/books/content?id=brief-history&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.94,
    },
    {
        "book_id": "isbn:9780198788607",
        "isbn": "9780198788607",
        "title": "El gen egoísta",
        "author": "Dawkins, Richard",
        "publisher": "Oxford University Press",
        "source_used": "open_library",
        "normalized_title": "El Gen Egoísta",
        "normalized_author": "Dawkins, Richard",
        "normalized_publisher": "Oxford University Press",
        "normalized_description": "Obra que popularizó la teoría del gen como unidad de selección natural y el concepto de meme.",
        "cover_url": "https://covers.openlibrary.org/b/isbn/9780198788607-L.jpg",
        "confidence_score": 0.91,
    },
    {
        "book_id": "isbn:9780345331359",
        "isbn": "9780345331359",
        "title": "Cosmos",
        "author": "Sagan, Carl",
        "publisher": "Random House",
        "source_used": "google_books",
        "normalized_title": "Cosmos",
        "normalized_author": "Sagan, Carl",
        "normalized_publisher": "Random House",
        "normalized_description": "Viaje por el universo que explora la historia de la astronomía, la ciencia y el lugar de la humanidad en el cosmos.",
        "cover_url": "https://books.google.com/books/content?id=cosmos-sagan&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.93,
    },
    {
        "book_id": "isbn:9780140432053",
        "isbn": "9780140432053",
        "title": "El origen de las especies",
        "author": "Darwin, Charles",
        "publisher": "John Murray",
        "source_used": "open_library",
        "normalized_title": "El Origen de las Especies",
        "normalized_author": "Darwin, Charles",
        "normalized_publisher": "John Murray",
        "normalized_description": "Obra fundacional de la biología evolutiva que presenta la teoría de la selección natural.",
        "cover_url": "https://covers.openlibrary.org/b/isbn/9780140432053-L.jpg",
        "confidence_score": 0.99,
    },
    {
        "book_id": "isbn:9788499924212",
        "isbn": "9788499924212",
        "title": "Sapiens: De animales a dioses",
        "author": "Harari, Yuval Noah",
        "publisher": "Debate",
        "source_used": "google_books",
        "normalized_title": "Sapiens: De Animales a Dioses",
        "normalized_author": "Harari, Yuval Noah",
        "normalized_publisher": "Debate",
        "normalized_description": "Historia breve de la humanidad desde la prehistoria hasta la era tecnológica moderna.",
        "cover_url": "https://books.google.com/books/content?id=sapiens&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.96,
    },
    {
        "book_id": "isbn:9788499926643",
        "isbn": "9788499926643",
        "title": "Homo Deus",
        "author": "Harari, Yuval Noah",
        "publisher": "Debate",
        "source_used": "google_books",
        "normalized_title": "Homo Deus: Breve Historia del Mañana",
        "normalized_author": "Harari, Yuval Noah",
        "normalized_publisher": "Debate",
        "normalized_description": "Exploración del futuro de la humanidad frente a los avances tecnológicos, la biotecnología y la inteligencia artificial.",
        "cover_url": "https://books.google.com/books/content?id=homo-deus&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.95,
    },
    {
        "book_id": "isbn:9780544176560",
        "isbn": "9780544176560",
        "title": "El nombre de la rosa",
        "author": "Eco, Umberto",
        "publisher": "Lumen",
        "source_used": "google_books",
        "normalized_title": "El Nombre de la Rosa",
        "normalized_author": "Eco, Umberto",
        "normalized_publisher": "Lumen",
        "normalized_description": "Novela histórica ambientada en una abadía medieval italiana donde un monje investiga una serie de misteriosas muertes.",
        "cover_url": "https://books.google.com/books/content?id=nombre-rosa&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.93,
    },
    {
        "book_id": "isbn:9780132350884",
        "isbn": "9780132350884",
        "title": "Clean Code",
        "author": "Martin, Robert C.",
        "publisher": "Prentice Hall",
        "source_used": "google_books",
        "normalized_title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "normalized_author": "Martin, Robert C.",
        "normalized_publisher": "Prentice Hall",
        "normalized_description": "Guía práctica para escribir código limpio, mantenible y de alta calidad siguiendo principios de artesanía del software.",
        "cover_url": "https://books.google.com/books/content?id=clean-code&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.97,
    },
    {
        "book_id": "isbn:9780201616224",
        "isbn": "9780201616224",
        "title": "The Pragmatic Programmer",
        "author": "Hunt, Andrew; Thomas, David",
        "publisher": "Addison-Wesley",
        "source_used": "open_library",
        "normalized_title": "The Pragmatic Programmer: From Journeyman to Master",
        "normalized_author": "Hunt, Andrew; Thomas, David",
        "normalized_publisher": "Addison-Wesley Professional",
        "normalized_description": "Colección de consejos prácticos para desarrolladores de software que buscan mejorar su efectividad profesional.",
        "cover_url": "https://covers.openlibrary.org/b/isbn/9780201616224-L.jpg",
        "confidence_score": 0.94,
    },
    {
        "book_id": "isbn:9780201633610",
        "isbn": "9780201633610",
        "title": "Design Patterns",
        "author": "Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John",
        "publisher": "Addison-Wesley",
        "source_used": "google_books",
        "normalized_title": "Design Patterns: Elements of Reusable Object-Oriented Software",
        "normalized_author": "Gamma, Erich; Helm, Richard; Johnson, Ralph; Vlissides, John",
        "normalized_publisher": "Addison-Wesley Professional",
        "normalized_description": "Catálogo de 23 patrones de diseño de software orientado a objetos reutilizables. Conocido como 'el libro de la Banda de los Cuatro'.",
        "cover_url": "https://books.google.com/books/content?id=design-patterns&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.98,
    },
    {
        "book_id": "isbn:9780262033848",
        "isbn": "9780262033848",
        "title": "Introduction to Algorithms",
        "author": "Cormen, Thomas H.",
        "publisher": "MIT Press",
        "source_used": "google_books",
        "normalized_title": "Introduction to Algorithms",
        "normalized_author": "Cormen, Thomas H.; Leiserson, Charles E.; Rivest, Ronald L.; Stein, Clifford",
        "normalized_publisher": "MIT Press",
        "normalized_description": "Referencia estándar en el estudio de algoritmos, estructuras de datos y análisis de complejidad computacional.",
        "cover_url": "https://books.google.com/books/content?id=intro-algorithms&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.99,
    },
    {
        "book_id": "isbn:9788424912765",
        "isbn": "9788424912765",
        "title": "La república",
        "author": "Platón",
        "publisher": "Gredos",
        "source_used": "open_library",
        "normalized_title": "La República",
        "normalized_author": "Platón",
        "normalized_publisher": "Editorial Gredos",
        "normalized_description": "Diálogo filosófico de Platón sobre la justicia, el orden ideal del Estado y la naturaleza del alma.",
        "cover_url": "https://covers.openlibrary.org/b/isbn/9788424912765-L.jpg",
        "confidence_score": 0.96,
    },
    {
        "book_id": "isbn:9788424908928",
        "isbn": "9788424908928",
        "title": "Meditaciones",
        "author": "Aurelio, Marco",
        "publisher": "Gredos",
        "source_used": "open_library",
        "normalized_title": "Meditaciones",
        "normalized_author": "Aurelio, Marco",
        "normalized_publisher": "Editorial Gredos",
        "normalized_description": "Reflexiones estoicas del emperador romano Marco Aurelio sobre virtud, razón y la transitoriedad de la vida.",
        "cover_url": "https://covers.openlibrary.org/b/isbn/9788424908928-L.jpg",
        "confidence_score": 0.95,
    },
    {
        "book_id": "isbn:9788478443482",
        "isbn": "9788478443482",
        "title": "El mundo de Sofía",
        "author": "Gaarder, Jostein",
        "publisher": "Siruela",
        "source_used": "google_books",
        "normalized_title": "El Mundo de Sofía",
        "normalized_author": "Gaarder, Jostein",
        "normalized_publisher": "Ediciones Siruela",
        "normalized_description": "Novela de iniciación filosófica que recorre toda la historia de la filosofía occidental a través de una joven protagonista.",
        "cover_url": "https://books.google.com/books/content?id=mundo-sofia&printsec=frontcover&img=1&zoom=1",
        "confidence_score": 0.92,
    },
    {
        "book_id": "isbn:9788420629865",
        "isbn": "9788420629865",
        "title": "Así habló Zaratustra",
        "author": "Nietzsche, Friedrich",
        "publisher": "Alianza Editorial",
        "source_used": "open_library",
        "normalized_title": "Así Habló Zaratustra",
        "normalized_author": "Nietzsche, Friedrich",
        "normalized_publisher": "Alianza Editorial",
        "normalized_description": "Obra filosófica central de Nietzsche que introduce conceptos como el superhombre, la voluntad de poder y el eterno retorno.",
        "cover_url": "https://covers.openlibrary.org/b/isbn/9788420629865-L.jpg",
        "confidence_score": 0.94,
    },
]


def run() -> None:
    session = Session()
    try:
        seeded = 0
        for data in ENRICHMENTS:
            existing = session.query(EnrichmentRequestModel).filter_by(
                book_id=data["book_id"]
            ).first()
            if existing:
                continue

            request = EnrichmentRequestModel(
                book_id=data["book_id"],
                isbn=data["isbn"],
                title=data["title"],
                author=data["author"],
                publisher=data["publisher"],
                status=EnrichmentStatusDB.completed,
                requested_at=datetime.datetime.now(datetime.timezone.utc),
                source_used=data["source_used"],
                error_message=None,
            )
            session.add(request)
            session.flush()

            result = EnrichmentResultModel(
                request_id=request.id,
                normalized_title=data["normalized_title"],
                normalized_author=data["normalized_author"],
                normalized_publisher=data["normalized_publisher"],
                normalized_description=data["normalized_description"],
                cover_url=data["cover_url"],
                confidence_score=data["confidence_score"],
                created_at=datetime.datetime.now(datetime.timezone.utc),
            )
            session.add(result)
            seeded += 1

        session.commit()
        print(f"Seeded {seeded} enrichment requests/results ({len(ENRICHMENTS) - seeded} already existed).")
    except Exception as exc:
        session.rollback()
        print(f"Seed failed: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run()
