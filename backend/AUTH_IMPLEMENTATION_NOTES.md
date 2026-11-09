# Customer auth implementation status

This is an early backend feature, **not yet production-ready**.

- New customer registration/login with Argon2 password hashing and revocable 24-hour bearer tokens.
- Authenticated /me, /me/orders and /logout endpoints.
- Order creation now requires authentication and assigns the logged-in customer ID.
- Old orders are intentionally left with null customer_id; they are not exposed via customer history.
- Database migration 0002 creates customer and session tables.
- /api/v1/assistant/chat currently uses fixed verified FAQ responses. It is **not an LLM integration**.
- Still required before public release: verified email/phone ownership, account recovery, rate limiting, bot protection, secure browser session handling, CORS, full DB integration tests, frontend forms, support escalation, and security review.
- Do not deploy this branch publicly as a payment application.
