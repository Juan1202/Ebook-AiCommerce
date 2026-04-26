import os
import pathlib

from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./test_audit.db"

from app.main import app

client = TestClient(app)

def teardown_module(module):
    db_path = pathlib.Path("test_audit.db")
    if db_path.exists():
        db_path.unlink()
    for suffix in ("-shm", "-wal"):
        path = pathlib.Path(f"test_audit.db{suffix}")
        if path.exists():
            path.unlink()


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_create_and_get_audit():
    payload = {
        "module": "Pricing",
        "decision": "Test de auditoría",
        "estado": "APROBADO",
        "source": "unit-test",
        "original_value": 22.0,
        "computed_value": 25.5,
        "anomaly": False,
        "rule": "Prueba automatizada",
        "detail": "Registro de auditoría creado desde test.",
    }

    r = client.post("/audit", json=payload)
    assert r.status_code == 201

    data = r.json()
    assert data["id"] is not None
    assert data["module"] == "Pricing"
    assert data["originalValue"] == 22.0
    assert data["computedValue"] == 25.5

    r2 = client.get(f"/audit/{data['id']}")
    assert r2.status_code == 200
    assert r2.json()["decision"] == "Test de auditoría"


def test_anomaly_detection():
    # Anomalía automática en pricing
    payload = {
        "module": "Pricing",
        "decision": "Precio outlier",
        "estado": "APROBADO",
        "source": "unit-test",
        "original_value": 100.0,
        "computed_value": 9.0,  # < 50% y < 10
        "rule": "Detección automática",
    }

    r = client.post("/audit", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["anomaly"] is True
    assert data["estado"] == "ANOMALÍA"


def test_list_audits():
    r = client.get("/audit")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "originalValue" in data[0]
    assert "computedValue" in data[0]


def test_get_audit_stats():
    r = client.get("/audit/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total_decisions" in data
    assert "approved_count" in data
    assert "anomaly_count" in data
    assert "error_count" in data
    assert "success_rate" in data
    assert "module_breakdown" in data
    assert isinstance(data["module_breakdown"], dict)
