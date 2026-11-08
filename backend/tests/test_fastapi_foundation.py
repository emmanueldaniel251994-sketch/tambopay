from fastapi.testclient import TestClient
from app.main import app
from app.schemas import OrderCreate
from pydantic import ValidationError
import pytest

client = TestClient(app)


def test_health():
    response = client.get('/api/v1/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_amount_converts_to_integer_kobo():
    order = OrderCreate(service='airtime', customer_reference='08012345678', amount='1000.50')
    assert int(order.amount * 100) == 100050


@pytest.mark.parametrize('amount', ['0', '99.99', '1000000.01', '100.001'])
def test_invalid_amount(amount):
    with pytest.raises(ValidationError):
        OrderCreate(service='airtime', customer_reference='08012345678', amount=amount)


def test_invalid_service():
    with pytest.raises(ValidationError):
        OrderCreate(service='wallet', customer_reference='08012345678', amount='100')
