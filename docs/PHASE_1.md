# Phase 1 implementation status

Airtime, data, electricity, cable TV, education and other bill categories. Direct checkout only, without wallet balances or transfers.

The frontend is a non-transactional prototype. No real money is charged. Before launch: integrate a payment processor and VTU aggregator server-side, persist orders, implement idempotency, verify signed webhooks and payment status independently, prevent duplicate fulfillment, reconcile settlements, and test refunds and failures.

Run `npm install`, `npm run dev`, `npm test`, and `npm run build`.
