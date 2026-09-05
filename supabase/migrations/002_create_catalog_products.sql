-- 002_create_catalog_products.sql
-- Product catalog — each product belongs to exactly one merchant

CREATE TABLE IF NOT EXISTS catalog_products (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id          UUID          NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name                 TEXT          NOT NULL,
  description          TEXT          NOT NULL DEFAULT '',
  semantic_description TEXT          NOT NULL DEFAULT '',
  price                NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  currency             TEXT          NOT NULL DEFAULT 'INR',
  category             TEXT          NOT NULL DEFAULT '',
  subcategory          TEXT          NOT NULL DEFAULT '',
  attributes           JSONB         NOT NULL DEFAULT '{}',
  inventory_count      INTEGER       NOT NULL DEFAULT 0 CHECK (inventory_count >= 0),
  is_active            BOOLEAN       NOT NULL DEFAULT TRUE,
  json_ld              JSONB,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_catalog_products_merchant ON catalog_products (merchant_id);
CREATE INDEX idx_catalog_products_category ON catalog_products (category, subcategory);
CREATE INDEX idx_catalog_products_active   ON catalog_products (merchant_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_catalog_products_price    ON catalog_products (merchant_id, price);
