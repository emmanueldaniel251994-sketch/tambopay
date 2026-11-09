# TamboPay customer portal staging

This branch adds /register, /login, /account, /support and Next.js server-side API proxies.

Set TAMBOPAY_API_URL to the FastAPI origin. Session bearer tokens are held in HttpOnly SameSite=Lax cookies, not localStorage. All account requests are forwarded server-side. HTTPS is required in deployed environments.

**Release blockers:** email ownership verification, password reset, login/registration throttling, CSRF assessment for cookie-authenticated mutation routes, integration tests, monitoring, provider verification, and production database readiness. /support currently calls the fixed FAQ backend and is not generative AI. Checkout is still a demo. Do not enable production payments.

For Render backend: configure PostgreSQL DATABASE_URL and run Alembic migrations. Never commit credentials. Configure Vercel GitHub integration and connect the frontend root directory. Do not deploy publicly until tests and security review pass.
