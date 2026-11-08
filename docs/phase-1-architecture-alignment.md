# TamboPay Phase 1 — Architecture Alignment and Migration Plan

Status: proposed; no live-payment approval. This branch is based on `feature/phase-1-secure-checkout`; PR #3 remains separate and unmerged.

## Approved product baseline

- Fixed initial-launch UI theme: **Style 2 — Vibrant & Consumer-Friendly**. Use the user-approved screenshot as the visual acceptance reference.
- Customer responsive web app, mobile-oriented screens, and administration dashboard.
- Services: airtime, data, electricity, cable TV, education and other supported bills.
- **Direct checkout only** through supported payment gateway methods; no stored-value wallet, funding, or wallet transfers in Phase 1.
- Customer authentication, dashboard, transaction history and receipts; administrator transaction monitoring, reconciliation, reporting and access controls.
- Approved architecture: **Next.js + TypeScript + Tailwind CSS** frontend; **FastAPI** backend; **PostgreSQL** database.
- Modular monolith; keep financial amounts in integer kobo, preserve unique references and idempotency.
- Development through feature branches and draft pull requests. Do not merge without explicit user approval.

## Current state (audit of the existing feature branch)

- Root Vite/JavaScript prototype with `src/main.js`, `src/style.css`, `src/catalog.js`; root `index.html` now uses Vite's module entry.
- Node.js API in `backend/` using `pg`; transaction validation, idempotency and Paystack sandbox-oriented payment verification work.
- Automated Node tests were reported passing (15 at repository root); Vite build completed without warnings.
- These passing tests **do not** establish parity with the approved Next.js/FastAPI stack, working customer accounts, fulfillment, live payments, or a completed admin dashboard.
- PR #3 remains a separate, unmerged secure-checkout prototype. Avoid production keys and real funds.

## Target repository layout

```
frontend/            # Next.js App Router, TypeScript, Tailwind customer experience
admin/               # Admin application or isolated Next.js admin workspace
backend/
  app/               # FastAPI modular monolith
  alembic/           # PostgreSQL schema migrations
  tests/             # API, payments, concurrency, authorization tests
docs/                # PRD, UX reference, migration and security decisions
.github/workflows/   # Frontend and backend CI
.env.example         # Names only; never commit secrets
```

## Migration sequence (separate reviewable commits/PRs)

1. **Baseline and visual specification:** retain the approved screenshot as an external reference; define responsive design tokens, pages, interaction states and accessible components. Do not fabricate transaction history or claim successful real payments.
2. **Next.js frontend:** build Style 2 responsive customer web pages with TypeScript/Tailwind; retain six service categories and no-wallet model. Add component and responsive tests. Keep existing Vite prototype until replacement is validated.
3. **FastAPI backend:** port the tested service catalog, integer-kobo validation, idempotency and order state machine. Build PostgreSQL models/Alembic migrations, transactional writes, constraints, authorization, audit logs and API tests. Do not remove the Node implementation until feature parity and tests are demonstrated.
4. **Sandbox checkout:** implement gateway initiation, server-side verification, authenticated webhooks, idempotent fulfillment orchestration and safe pending/failure/refund handling. Never trust client-side payment status.
5. **Customer and admin workflows:** authentication, order history, receipts, service-provider adapters, admin permissions, reconciliation and support tools. Use sandbox/sample data visibly labeled as such.
6. **Readiness gates:** local PostgreSQL integration, end-to-end sandbox tests, retries and concurrent-request tests, secrets review, rate limits, monitoring, accessibility, mobile QA, financial reconciliation and partner approval before production.

## Review and safety gates

- No wallet functionality in Phase 1; later wallet changes require a new approved PRD and licensed-provider arrangement.
- No production payments, provider fulfillment, or stored customer funds during prototype work.
- Keep PR #3 open/unmerged; this alignment branch starts from it and must not be merged independently into main without reviewing its inherited changes.
- User must approve visual fidelity against Style 2 and migration results before merging.
- Current Node/Vite functionality is a migration reference, not the final approved stack.

## Immediate next implementation slice

Scaffold the Next.js/TypeScript/Tailwind frontend in `frontend/` with the approved Style 2 customer homepage and responsive quick-pay flow; validate `npm run build` and tests. Follow with FastAPI backend scaffolding and PostgreSQL integration. Avoid mixing the complete architecture migration into a single untested change.
