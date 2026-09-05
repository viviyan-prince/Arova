-- 004_create_agent_sessions.sql
-- Agent sessions — one row per buyer-agent conversation

CREATE TABLE IF NOT EXISTS agent_sessions (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id       UUID          NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  agent_identity    TEXT          NOT NULL,
  agent_type        TEXT          NOT NULL DEFAULT 'unknown',
  trust_score       NUMERIC(4,3) NOT NULL DEFAULT 0.500 CHECK (trust_score >= 0 AND trust_score <= 1),
  spending_limit    NUMERIC(12,2) NOT NULL DEFAULT 100000.00,
  total_spent       NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (total_spent >= 0),
  interaction_count INTEGER       NOT NULL DEFAULT 0 CHECK (interaction_count >= 0),
  status            TEXT          NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_sessions_merchant ON agent_sessions (merchant_id);
CREATE INDEX idx_agent_sessions_status   ON agent_sessions (merchant_id, status);
CREATE INDEX idx_agent_sessions_identity ON agent_sessions (agent_identity);
