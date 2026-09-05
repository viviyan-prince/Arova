-- 006_create_audit_log.sql
-- Immutable audit trail — every action logged with AI involvement metadata

CREATE TABLE IF NOT EXISTS audit_log (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id        UUID        NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  session_id         UUID        REFERENCES agent_sessions(id),
  transaction_id     UUID        REFERENCES transactions(id),
  event_type         TEXT        NOT NULL,
  event_data         JSONB       NOT NULL DEFAULT '{}',
  ai_involved        BOOLEAN     NOT NULL DEFAULT FALSE,
  ai_model           TEXT,
  ai_input_summary   TEXT,
  ai_output_summary  TEXT,
  decision_reasoning TEXT        NOT NULL DEFAULT '',
  latency_ms         INTEGER     NOT NULL DEFAULT 0 CHECK (latency_ms >= 0),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_merchant    ON audit_log (merchant_id);
CREATE INDEX idx_audit_log_session     ON audit_log (session_id);
CREATE INDEX idx_audit_log_transaction ON audit_log (transaction_id);
CREATE INDEX idx_audit_log_event_type  ON audit_log (event_type);
CREATE INDEX idx_audit_log_ai          ON audit_log (ai_involved) WHERE ai_involved = TRUE;
CREATE INDEX idx_audit_log_created     ON audit_log (created_at DESC);
