# Sandbox direct checkout — implementation review

**Do not deploy publicly or use live payment credentials.** This milestone adds an opt-in Paystack test-key integration; it does not fulfill VTU orders.

1. Apply `backend/sql/001_transactions.sql` then `backend/sql/002_checkout.sql` to PostgreSQL.
2. Set `DATABASE_URL`, `CORS_ORIGIN`, `ENABLE_SANDBOX_CHECKOUT=true`, `PAYSTACK_SECRET_KEY=sk_test_...`, and `CHECKOUT_CALLBACK_URL` to an approved HTTPS frontend callback.
3. Create an order with `POST /api/v1/transactions`, JSON body `{"service":"airtime","customerReference":"08012345678","amount":"100.00"}` and unique `Idempotency-Key` (16–128 chars).
4. **Save the one-time `accessToken`** returned on first creation; retries cannot retrieve it. A lost token requires a new order.
5. Start sandbox checkout using `POST /api/v1/transactions/{id}/checkout`, `Authorization: Bearer {accessToken}`, JSON `{"email":"buyer@example.com"}`. The response contains a Paystack sandbox authorization URL.
6. Configure Paystack test webhook to `POST /api/v1/webhooks/paystack`. HMAC-SHA512 signature is checked against the raw request body. On charge.success, the server independently verifies reference, amount, currency and success status through Paystack before marking paid.
7. Check transaction status with `GET /api/v1/transactions/{id}` using the same bearer token.

## Important limitations
- Checkout is **disabled by default** and only accepts Paystack **test** secret keys.
- A paid transaction does not deliver airtime/data/bills; fulfillment integration is not yet implemented.
- The bearer token is a capability secret, not a full account identity. Never put it in URLs, logs or analytics. Rate limiting, authentication, abuse protection and token recovery need design before production.
- Concurrent checkout initialization, provider timeouts, webhook retries, and reconciliation require further hardening. Do not use this integration with real customer funds.
- Older orders created before migration have no access token; they cannot be accessed through authenticated status routes.
- The frontend has not yet been wired to the checkout API.
