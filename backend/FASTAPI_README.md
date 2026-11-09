# FastAPI foundation (parallel migration)

This is a **new Python backend scaffold** alongside the existing Node API; the Node API has not been removed. No real payment initiation, webhook processing or service fulfillment is implemented here. New database tables use the `v2_` prefix to avoid collisions with legacy Node tables. **Do not run migrations against a production database without a schema review and backup.**

## Local setup (Mac)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
pytest -q
```

To use PostgreSQL, create a local database and set `DATABASE_URL` (see `.env.fastapi.example`). Then run:

```bash
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Check `http://localhost:8000/api/v1/health` and `http://localhost:8000/api/docs`. The `/api/v1/orders` endpoint persists demo orders; it does **not** process money or deliver services. Production work still requires authentication, authorization, request idempotency, provider integration, rate limiting, reconciliation and more tests.
