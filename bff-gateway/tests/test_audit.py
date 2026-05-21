from fastapi.testclient import TestClient
from app.audit import clear_audit_events
from app.main import app

client = TestClient(app)


def setup_function():
    clear_audit_events()


def test_create_and_list_audit_event():
    payload = {
        "event_type": "pedido",
        "category": "business",
        "description": "Orden de ejemplo creada",
        "service": "pricing",
        "path": "pricing/calculate",
        "status_code": 200,
        "metadata": {"source": "test"},
    }
    response = client.post("/api/admin/audit/events", json=payload)
    assert response.status_code == 200
    event = response.json()
    assert event["event_type"] == "pedido"
    assert event["service"] == "pricing"
    assert event["metadata"]["source"] == "test"

    history = client.get("/api/admin/audit/events")
    assert history.status_code == 200
    assert isinstance(history.json(), list)
    assert len(history.json()) == 1
    assert history.json()[0]["description"] == "Orden de ejemplo creada"


def test_filter_audit_events_by_type():
    client.post("/api/admin/audit/events", json={
        "event_type": "consulta_ia",
        "category": "business",
        "description": "Consulta IA de prueba",
        "service": "enrichment",
    })
    client.post("/api/admin/audit/events", json={
        "event_type": "error",
        "category": "technical",
        "description": "Error de prueba",
        "service": "catalog",
    })

    response = client.get("/api/admin/audit/events?event_type=consulta_ia")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["service"] == "enrichment"


def test_audit_statistics_reflects_events():
    client.post("/api/admin/audit/events", json={
        "event_type": "consulta_ia",
        "category": "business",
        "description": "Consulta IA estadística",
        "service": "enrichment",
    })
    client.post("/api/admin/audit/events", json={
        "event_type": "error",
        "category": "technical",
        "description": "Error estadístico",
        "service": "pricing",
    })

    response = client.get("/api/admin/audit/statistics")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_events"] == 2
    assert stats["events_by_type"]["consulta_ia"] == 1
    assert stats["events_by_type"]["error"] == 1
    assert stats["events_by_category"]["business"] == 1
    assert stats["events_by_category"]["technical"] == 1


def test_proxy_error_is_audited():
    response = client.get("/api/catalog/books/")
    assert response.status_code == 503

    history = client.get("/api/admin/audit/events?event_type=error")
    assert history.status_code == 200
    events = history.json()
    assert len(events) >= 1
    assert any(event["service"] == "catalog" for event in events)
