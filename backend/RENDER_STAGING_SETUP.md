# Render staging database connection

The Render staging API and dedicated PostgreSQL database exist, but they must be connected and migrated before customer flows work.

1. In the Render database dashboard for **tambopay-staging-db**, copy the **Internal Database URL** using Render's secret reveal control. Do not paste it into GitHub, chat, logs or public screenshots.
2. In the Render web service **tambopay-staging-api**, add a secret environment variable `DATABASE_URL` using that internal URL. SQLAlchemy uses psycopg3, so change only the URL scheme from `postgresql://` to `postgresql+psycopg://` if necessary.
3. Configure a pre-deploy command in the Render dashboard: `cd backend && alembic upgrade head`. Keep the start command `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`. On the free plan, pre-deploy commands may be unavailable; if so, migrate through a controlled one-off job or an approved deployment workflow before serving traffic.
4. After the readiness change is merged and deployed, verify `/api/v1/ready` returns HTTP 200 with migration `0002_customer_accounts`. HTTP 503 means the database is unreachable or not migrated.
5. Run a staging-only registration/login/logout flow using a throwaway account, verify account isolation, and remove test data according to policy.
6. Never enable production payments or public registration before rate limiting, email verification, CSRF review, and security tests.

The existing `/api/v1/health` is only a process liveness endpoint; it does not prove database connectivity.

The Render free database expires December 9, 2026. Plan a durable database and backup strategy before production.
