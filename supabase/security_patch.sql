-- ============================================================================
-- JJ CRACKERS PRODUCTION PROTECTION - DATABASE SECURITY PATCH
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gllzlcgykefdmqhcfxjr/sql/new
-- ============================================================================

-- 1. DROP ALL INSECURE PERMISSIVE WRITE POLICIES
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;

DROP POLICY IF EXISTS "Anyone can insert combos" ON combo_packs;
DROP POLICY IF EXISTS "Anyone can update combos" ON combo_packs;
DROP POLICY IF EXISTS "Anyone can delete combos" ON combo_packs;

DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;

-- 2. ENSURE ROW LEVEL SECURITY IS STRICTLY ENABLED
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 3. ESTABLISH SAFE READ-ONLY POLICIES FOR PUBLIC / STOREFRONT
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read combos" ON combo_packs;
CREATE POLICY "Public read combos" ON combo_packs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- 4. RESTRICT WRITES EXCLUSIVELY TO SERVICE_ROLE (BACKEND API ONLY)
DROP POLICY IF EXISTS "Service role manages products" ON products;
CREATE POLICY "Service role manages products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages combos" ON combo_packs;
CREATE POLICY "Service role manages combos" ON combo_packs FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages categories" ON categories;
CREATE POLICY "Service role manages categories" ON categories FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages site_settings" ON site_settings;
CREATE POLICY "Service role manages site_settings" ON site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. CREATE IMMUTABLE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  target_ids JSONB DEFAULT '[]'::jsonb,
  before_state JSONB,
  after_state JSONB,
  approval_id TEXT,
  ip_address TEXT,
  status TEXT NOT NULL,
  details TEXT
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only service_role can insert or view audit logs
DROP POLICY IF EXISTS "Service role inserts audit logs" ON audit_logs;
CREATE POLICY "Service role inserts audit logs" ON audit_logs FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "Service role selects audit logs" ON audit_logs;
CREATE POLICY "Service role selects audit logs" ON audit_logs FOR SELECT TO service_role USING (true);

-- 6. AUDIT TAMPER-RESISTANCE TRIGGER (BLOCKS UPDATES & DELETIONS)
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'SECURITY VIOLATION: Audit logs are append-only and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_update ON audit_logs;
CREATE TRIGGER trg_prevent_audit_update
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

DROP TRIGGER IF EXISTS trg_prevent_audit_delete ON audit_logs;
CREATE TRIGGER trg_prevent_audit_delete
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_modification();

-- 7. SERVER-SIDE APPROVAL CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS catalog_approvals (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  target_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  payload_hash TEXT NOT NULL,
  preview_summary TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ
);

ALTER TABLE catalog_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages approvals" ON catalog_approvals;
CREATE POLICY "Service role manages approvals" ON catalog_approvals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. PRODUCT INTEGRITY CONSTRAINT
-- Ensure every product belongs to an existing category
ALTER TABLE products DROP CONSTRAINT IF EXISTS fk_products_category;
ALTER TABLE products ADD CONSTRAINT fk_products_category
  FOREIGN KEY (category) REFERENCES categories(id)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- Index for instant catalog query performance
CREATE INDEX IF NOT EXISTS idx_products_category_sort ON products(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
