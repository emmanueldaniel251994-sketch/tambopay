"""Customer registration and account endpoints. Do not expose email verification as complete."""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .auth import current_customer, hash_token, issue_session, password_hash
from .db import get_db
from .models import Customer, CustomerSession, Order

router = APIRouter(prefix="/api/v1/customers", tags=["customers"])


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class CustomerView(BaseModel):
    id: str
    email: EmailStr
    model_config = {"from_attributes": True}


@router.post("/register", response_model=CustomerView, status_code=status.HTTP_201_CREATED)
def register(payload: Credentials, db: Session = Depends(get_db)):
    email = payload.email.lower().strip()
    customer = Customer(id=str(uuid.uuid4()), email=email, password_hash=password_hash.hash(payload.password))
    db.add(customer)
    try:
        db.commit()
        db.refresh(customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Account already exists")
    return customer


@router.post("/login")
def login(payload: Credentials, db: Session = Depends(get_db)):
    customer = db.scalar(select(Customer).where(Customer.email == payload.email.lower().strip()))
    if customer is None:
        # Dummy verification helps reduce account enumeration via timing.
        password_hash.verify(payload.password, DUMMY_HASH)
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not password_hash.verify(payload.password, customer.password_hash) or not customer.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": issue_session(db, customer), "token_type": "bearer", "expires_in": 86400}


DUMMY_HASH = password_hash.hash("dummy-password-for-timing-only")


@router.get("/me", response_model=CustomerView)
def me(customer: Customer = Depends(current_customer)):
    return customer


@router.get("/me/orders")
def my_orders(customer: Customer = Depends(current_customer), db: Session = Depends(get_db)):
    orders = db.scalars(select(Order).where(Order.customer_id == customer.id).order_by(Order.created_at.desc()).limit(100)).all()
    return [{"id": o.id, "reference": o.reference, "service": o.service, "amount_kobo": o.amount_kobo, "status": o.status} for o in orders]


@router.post("/logout", status_code=204)
def logout(customer: Customer = Depends(current_customer), db: Session = Depends(get_db),
           credentials=Depends(__import__("fastapi").security.HTTPBearer())):
    session = db.scalar(select(CustomerSession).where(CustomerSession.token_hash == hash_token(credentials.credentials), CustomerSession.customer_id == customer.id))
    if session:
        from datetime import datetime, timezone
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()
