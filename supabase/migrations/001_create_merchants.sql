-- 001_create_merchants.sql
-- Merchant accounts — one row per onboarded seller

CREATE TABLE IF NOT EXISTS merchants (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  razorpay_key_id     TEXT        NOT NULL,
  razorpay_key_secret TEXT        NOT NULL,
  business_type       TEXT        NOT NULL DEFAULT 'general',
  agent_endpoint_slug TEXT        NOT NULL UNIQUE,
  settings            JSONB       NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_merchants_slug ON merchants (agent_endpoint_slug);
CREATE INDEX idx_merchants_business_type ON merchants (business_type);
