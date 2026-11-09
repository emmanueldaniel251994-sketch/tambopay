"""Readiness check for the configured database and current Alembic revision."""
from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from .db import engine

router = APIRouter(tags=["health"])


@router.get("/api/v1/ready")
def ready():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            current = connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one_or_none()
            if current != "0002_customer_accounts":
                raise HTTPException(status_code=503, detail="Database migrations pending")
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Database unavailable")
    return {"status": "ready", "database": "connected", "migration": "0002_customer_accounts"}
