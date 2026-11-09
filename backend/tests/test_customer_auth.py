from fastapi.testclient import TestClient
from app.main import app
from app.auth import hash_token, password_hash

client = TestClient(app)


def test_password_hash_not_plaintext():
    digest = password_hash.hash("a-long-unique-password")
    assert digest != "a-long-unique-password"
    assert password_hash.verify("a-long-unique-password", digest)
    assert not password_hash.verify("wrong-password", digest)


def test_token_hash_deterministic():
    assert hash_token("secret") == hash_token("secret")
    assert hash_token("secret") != hash_token("different")


def test_order_creation_requires_authentication():
    response = client.post("/api/v1/orders", json={
        "service": "airtime", "amount": "100.00", "customer_reference": "08000000000"
    })
    assert response.status_code == 401


def test_me_requires_authentication():
    assert client.get("/api/v1/customers/me").status_code == 401


def test_assistant_does_not_claim_ai_enabled():
    response = client.post("/api/v1/assistant/chat", json={"message": "Do you offer a wallet?"})
    assert response.status_code == 200
    assert response.json()["ai_enabled"] is False
