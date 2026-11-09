"""Customer authentication: Argon2id password hashes and revocable opaque bearer tokens."""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import Customer, CustomerSession

password_hash = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def issue_session(db: Session, customer: Customer) -> str:
    token = secrets.token_urlsafe(48)
    db.add(CustomerSession(
        id=str(uuid.uuid4()),
        customer_id=customer.id,
        token_hash=hash_token(token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
    ))
    db.commit()
    return token


def current_customer(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> Customer:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    session = db.scalar(select(CustomerSession).where(CustomerSession.token_hash == hash_token(credentials.credentials)))
    if session is None or session.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires = session.expires_at
    if expires.replace(tzinfo=timezone.utc) <= datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    customer = db.get(Customer, session.customer_id)
    if customer is None or not customer.is_active:
        raise HTTPException(status_code=401, detail="Account unavailable")
    return customer
