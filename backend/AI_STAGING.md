# TamboPay verified AI assistant — staging

The assistant uses an optional OpenAI Responses API integration. Set AI_API_KEY **only in Render's secret environment variables**. Optionally set AI_MODEL (default gpt-4.1-mini). Without a key, the service safely returns verified FAQ responses.

The assistant receives only the customer's current question and a small verified TamboPay facts block. It has no access to customer data, orders, payment credentials or external tools, and cannot execute transactions. OpenAI request storage is disabled with store=false.

## Before enabling publicly

- Implement per-IP/customer rate limiting and budget caps to prevent API abuse.
- Add human support contact details and escalation.
- Add content review, prompt-injection testing, logging that excludes user secrets, and abuse monitoring.
- Ensure provider data retention and privacy policy meet your obligations.
- Test model responses against unsupported price, account status, refund and payment claims.
- Run backend tests and stage with sandbox payments only.
- Ensure that no AI key is committed to Git or exposed in NEXT_PUBLIC_ frontend variables.
- Add verified school-like service data only after confirming provider contracts and current offerings.

The AI is informational support only. It does not perform payment actions.
