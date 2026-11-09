import uuid
from decimal import Decimal
from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from .db import get_db
from .models import Order
from .schemas import OrderCreate, OrderOut
from .auth import current_customer
from .models import Customer
from .customer_routes import router as customer_router
from .ai_routes import router as assistant_router
from .readiness import router as readiness_router

app = FastAPI(title='TamboPay API', version='0.1.0', docs_url='/api/docs', openapi_url='/api/openapi.json')


app.include_router(customer_router)
app.include_router(assistant_router)
app.include_router(readiness_router)


@app.get('/api/v1/health')
def health():
    return {'status': 'ok', 'service': 'tambopay-api', 'mode': 'foundation'}


@app.post('/api/v1/orders', response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db), customer: Customer = Depends(current_customer)):
    # Foundation only: order creation does NOT charge or fulfill a service.
    amount_kobo = int(payload.amount * Decimal('100'))
    order = Order(customer_id=customer.id, reference=f'TP-{uuid.uuid4().hex}', service=payload.service, customer_reference=payload.customer_reference, amount_kobo=amount_kobo)
    db.add(order)
    try:
        db.commit()
        db.refresh(order)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail='Duplicate order reference')
    return order
