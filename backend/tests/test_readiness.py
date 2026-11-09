from fastapi.testclient import TestClient
from app.main import app


def test_health_does_not_require_database():
    response = TestClient(app).get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_readiness_route_is_registered():
    assert any(getattr(route, "path", None) == "/api/v1/ready" for route in app.routes)
