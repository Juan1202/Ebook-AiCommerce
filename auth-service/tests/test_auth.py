from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_mock_token_returned():
    response = client.get("/auth/mock-token")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_verify_mock_token():
    token = client.get("/auth/mock-token").json()["access_token"]
    resp = client.get("/auth/verify", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["role"] == "admin"


def test_verify_invalid_token():
    resp = client.get("/auth/verify", headers={"Authorization": "Bearer invalid"})
    assert resp.status_code == 401
