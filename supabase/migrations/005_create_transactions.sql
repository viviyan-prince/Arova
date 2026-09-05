-- 005_create_transactions.sql
-- Transactions — tracks each order through the Razorpay payment lifecycle

CREATE TABLE IF NOT EXISTS transactions (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           UUID          NOT NULL REFERENCES agent_sessions(id),
  merchant_id          UUID          NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  razorpay_order_id    TEXT          NOT NULL,
  razorpay_payment_id  TEXT,
  amount               NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency             TEXT          NOT NULL DEFAULT 'INR',
  status               TEXT          NOT NULL DEFAULT 'initiated'
                                     CHECK (status IN ('initiated','authorized','captured','failed','refunded')),
  items                JSONB         NOT NULL DEFAULT '[]',
  negotiation_history  JSONB         NOT NULL DEFAULT '[]',
  payment_method       TEXT,
  failure_reason       TEXT,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_transactions_razorpay_order ON transactions (razorpay_order_id);
CREATE INDEX idx_transactions_session    ON transactions (session_id);
CREATE INDEX idx_transactions_merchant   ON transactions (merchant_id);
CREATE INDEX idx_transactions_status     ON transactions (merchant_id, status);
CREATE INDEX idx_transactions_created    ON transactions (created_at DESC);
