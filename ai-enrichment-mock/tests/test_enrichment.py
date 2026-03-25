from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/enrichment/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_enrich_single():
    payload = {
        "book_reference": "REF-001",
        "title": "Cien Años de Soledad",
        "author": "Gabriel García Márquez",
        "isbn": "978-0-06-088328-7",
    }
    r = client.post("/enrichment/enrich", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["book_reference"] == "REF-001"
    assert data["normalized_title"] == "Cien Años De Soledad"
    assert data["normalized_author"] == "Gabriel García Márquez"
    assert 0.65 <= data["confidence_score"] <= 1.0
    assert data["publication_year"] >= 1980
    assert data["source_used"] == "mock_google_books"
    assert data["metadata"]["isbn_verified"] is True


def test_enrich_single_deterministic():
    payload = {
        "book_reference": "REF-001",
        "title": "Cien Años de Soledad",
        "author": "Gabriel García Márquez",
    }
    r1 = client.post("/enrichment/enrich", json=payload)
    r2 = client.post("/enrichment/enrich", json=payload)
    assert r1.json()["confidence_score"] == r2.json()["confidence_score"]
    assert r1.json()["publication_year"] == r2.json()["publication_year"]


def test_enrich_batch():
    payload = {
        "items": [
            {"book_reference": "REF-A", "title": "Don Quijote", "author": "Cervantes"},
            {"book_reference": "REF-B", "title": "La Odisea", "author": "Homero"},
        ]
    }
    r = client.post("/enrichment/enrich/batch", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 2
    refs = {item["book_reference"] for item in data}
    assert refs == {"REF-A", "REF-B"}


def test_enrich_no_isbn():
    payload = {
        "book_reference": "REF-002",
        "title": "El Aleph",
        "author": "Jorge Luis Borges",
    }
    r = client.post("/enrichment/enrich", json=payload)
    assert r.status_code == 200
    assert r.json()["metadata"]["isbn_verified"] is False
