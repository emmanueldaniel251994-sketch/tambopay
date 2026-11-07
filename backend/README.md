# TamboPay backend foundation

Node.js 20+ HTTP API with PostgreSQL persistence. **No payment gateway, webhook, provider fulfillment, or wallet is implemented.** Created orders remain pending. Do not expose this API publicly as production-ready.

## Setup
1. Create a PostgreSQL database and apply `backend/sql/001_transactions.sql` with `psql "$DATABASE_URL" -f backend/sql/001_transactions.sql` from the repository root.
2. From `backend/`, run `npm install`.
3. Set `DATABASE_URL`, `PORT` and `CORS_ORIGIN` as environment variables (see `.env.example`; the app does not automatically load .env).
4. Run `npm test` and `npm start`.

## Endpoints
- `GET /health`: process liveness (not database readiness).
- `POST /api/v1/transactions`: JSON `{"service":"airtime","customerReference":"08012345678","amount":"100.00"}` with `Idempotency-Key: <random 16–128-character token>`. Creates or retrieves pending transaction; 409 if key is reused with different request.
- `GET /api/v1/transactions/:id`: returns public transaction fields only.

Amounts are decimal **strings** in NGN; database stores integer kobo. Never put card details or API secrets in requests. This is a foundation, not a live checkout.

## Production blockers
Authentication/ownership and access control on transaction lookup, rate limiting, secure provider integration, verified webhook signatures, independently confirmed payment status, fulfillment and reconciliation, migrations tooling, deployment hardening, database readiness and observability must be implemented and reviewed before public deployment. The API intentionally does not allow clients to mark transactions paid.
