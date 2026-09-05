-- 003_create_commerce_rules.sql
-- Commerce rules — plain-English originals + compiled JSONB for the rule engine

CREATE TABLE IF NOT EXISTS commerce_rules (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id    UUID        NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  rule_type      TEXT        NOT NULL CHECK (rule_type IN ('acceptance','pricing','shipping','negotiation','return')),
  description    TEXT        NOT NULL,
  compiled_rule  JSONB       NOT NULL DEFAULT '{}',
  priority       INTEGER     NOT NULL DEFAULT 0,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commerce_rules_merchant ON commerce_rules (merchant_id);
CREATE INDEX idx_commerce_rules_type     ON commerce_rules (merchant_id, rule_type) WHERE is_active = TRUE;
CREATE INDEX idx_commerce_rules_priority ON commerce_rules (merchant_id, priority DESC);
