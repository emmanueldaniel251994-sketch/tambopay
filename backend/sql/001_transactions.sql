CREATE TABLE IF NOT EXISTS transactions (
 id UUID PRIMARY KEY,
 idempotency_key VARCHAR(128) NOT NULL UNIQUE,
 request_hash CHAR(64) NOT NULL,
 service VARCHAR(24) NOT NULL CHECK (service IN ('airtime','data','electricity','cable','education','other')),
 customer_reference VARCHAR(60) NOT NULL,
 amount_kobo BIGINT NOT NULL CHECK (amount_kobo BETWEEN 10000 AND 100000000),
 currency CHAR(3) NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
 status VARCHAR(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','paid','failed','cancelled')),
 provider_reference VARCHAR(128) UNIQUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);
