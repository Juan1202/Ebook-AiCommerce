from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    r = client.get("/quality/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_summary_uses_mock_fallback():
    # inventory-service is not running in test env → falls back to mock data
    r = client.get("/quality/summary")
    assert r.status_code == 200
    data = r.json()
    assert "total_batches" in data
    assert data["total_batches"] > 0
    assert "batches" in data
    assert isinstance(data["batches"], list)


def test_list_batches_fallback():
    r = client.get("/quality/batches")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_batch_report_fallback():
    r = client.get("/quality/batches/1/report")
    assert r.status_code == 200
    data = r.json()
    assert data["batch_id"] == 1
    assert "errors" in data
    assert isinstance(data["errors"], list)


def test_batch_not_found():
    r = client.get("/quality/batches/9999/report")
    assert r.status_code == 404
