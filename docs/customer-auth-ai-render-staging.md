# TamboPay: customer accounts, AI support, and staging deployment

Status: implementation specification, **not a production-ready release**.

## Individual customer accounts

- Each customer registers with a unique verified email or phone number and a password.
- Passwords must be hashed with a current password hashing algorithm (Argon2id preferred); never store plaintext.
- Provide login, logout, password reset, verification, session expiration, and rate limiting.
- Use server-side authorization on every order and transaction query; customer A must never read customer B's records.
- Record an immutable customer identifier on each order; migrate existing orders carefully.
- Keep admin roles separate from customer roles; apply least privilege.
- Do not introduce a stored-value wallet. Checkout remains direct-to-payment-provider.

## AI assistance

- Add an authenticated in-app support chat, plus a limited anonymous FAQ mode.
- Only answer product questions using approved TamboPay service information.
- Account-specific status lookups must use the logged-in customer's authorized API and never trust an order ID alone.
- AI may explain status but cannot create payments, alter transactions, issue refunds, or mark orders fulfilled.
- Redact credentials, card information, and sensitive data from prompts and logs; apply rate limits and abuse controls.
- Provide human-support escalation when confidence is low, and disclose that the user is chatting with AI.
- Keep the model provider configurable via server-side environment variables; never expose AI API keys in browser code.

## Hosting

- Frontend: Vercel (Next.js); requires Vercel GitHub integration for this repository.
- Backend: Render Python web service (FastAPI), root directory backend, health check /api/v1/health.
- Database: dedicated PostgreSQL for TamboPay; never reuse another application's database.
- Use a staging environment and sandbox payment keys only. Set DATABASE_URL and other secrets in the hosting dashboard, not Git.
- Apply Alembic migrations before enabling API traffic; confirm persistent database and backups.
- Enable strict CORS allowlist, HTTPS, audit logs, webhook signature verification, idempotency, and end-to-end tests.
- Do not expose the existing demo order creation endpoint to the public without authentication and authorization.
- Reconcile the Next.js frontend and FastAPI code onto a common branch before attempting a deploy.

## Release gates

1. Verify main/feature branch history and ensure frontend and backend exist together.
2. Implement and test registration, login, session security, and ownership isolation.
3. Implement AI assistant with approved knowledge and authenticated account-specific tool access.
4. Provision Render Postgres and API; configure Vercel integration and preview environment.
5. Run CI, database migrations, auth/authorization tests, payment sandbox tests, and security review.
6. Publish staging URLs and verify live health and customer flows. Production deployment requires separate approval.
