from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    assert "routes" in data


def test_unknown_service_returns_404():
    r = client.get("/api/nonexistent/health")
    assert r.status_code == 404


def test_unavailable_service_returns_503():
    # catalog-service is not running in unit test env
    r = client.get("/api/catalog/books/")
    assert r.status_code == 503
