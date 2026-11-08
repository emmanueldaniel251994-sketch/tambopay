ALTER TABLE transactions ADD COLUMN IF NOT EXISTS access_token_hash CHAR(64);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS checkout_url TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS transactions_provider_reference_idx ON transactions(provider_reference);
-- Existing transactions cannot be accessed until an owner token is issued by an administrator.
