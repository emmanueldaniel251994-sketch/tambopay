from fastapi.testclient import TestClient
from app.main import app
from app.ai_routes import SYSTEM_INSTRUCTIONS, faq_answer
from app.config import settings


def test_verified_context_rejects_payment_claims():
    assert "Never claim to see an account" in SYSTEM_INSTRUCTIONS
    assert "no stored-value wallet" in SYSTEM_INSTRUCTIONS.lower()


def test_fallback_is_safe():
    assert "without a stored-value wallet" in faq_answer("Do you have a wallet?")
    assert "cannot verify or change" in faq_answer("Was my payment successful?")


def test_assistant_uses_faq_without_api_key(monkeypatch):
    monkeypatch.setattr(settings, "ai_api_key", None)
    response = TestClient(app).post("/api/v1/assistant/chat", json={"message": "How can I buy airtime?"})
    assert response.status_code == 200
    assert response.json()["provider"] == "verified-faq"
    assert response.json()["ai_enabled"] is False


def test_assistant_rejects_oversized_messages():
    response = TestClient(app).post("/api/v1/assistant/chat", json={"message": "a" * 501})
    assert response.status_code == 422
