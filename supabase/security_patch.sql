-- ============================================================================
-- JJ CRACKERS (JEGAJOTHI CRACKERS) - FULL ADMIN DATABASE ACCESS FIX
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gllzlcgykefdmqhcfxjr/sql/new
-- ============================================================================

-- 1. PRODUCTS: FULL READ & WRITE ACCESS FOR STORE AND ADMIN PANEL
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;
DROP POLICY IF EXISTS "Service role manages products" ON products;
DROP POLICY IF EXISTS "Allow product update" ON products;
DROP POLICY IF EXISTS "Admin manage products" ON products;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON products FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 2. CATEGORIES: FULL READ & WRITE ACCESS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Anyone can insert categories" ON categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON categories;
DROP POLICY IF EXISTS "Service role manages categories" ON categories;
DROP POLICY IF EXISTS "Admin manage categories" ON categories;

CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 3. SITE SETTINGS: FULL READ & WRITE ACCESS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Service role manages site_settings" ON site_settings;
DROP POLICY IF EXISTS "Admin manage site_settings" ON site_settings;

CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage site_settings" ON site_settings FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 4. ORDERS: FULL READ & WRITE ACCESS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Admin manage orders" ON orders;

CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin manage orders" ON orders FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 5. COMBOS: FULL READ & WRITE ACCESS
ALTER TABLE combo_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read combos" ON combo_packs;
DROP POLICY IF EXISTS "Service role manages combos" ON combo_packs;
DROP POLICY IF EXISTS "Admin manage combos" ON combo_packs;

CREATE POLICY "Public read combos" ON combo_packs FOR SELECT USING (true);
CREATE POLICY "Admin manage combos" ON combo_packs FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 6. AUDIT LOGS: APPEND & READ PERMISSION
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
DROP POLICY IF EXISTS "Admin audit logs access" ON audit_logs;
CREATE POLICY "Admin audit logs access" ON audit_logs FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 7. CATALOG APPROVALS: FULL ACCESS
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
DROP POLICY IF EXISTS "Admin approvals access" ON catalog_approvals;
CREATE POLICY "Admin approvals access" ON catalog_approvals FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 8. INDEXES FOR HIGH-SPEED PRODUCT AND CATEGORY QUERIES
CREATE INDEX IF NOT EXISTS idx_products_category_sort ON products(category, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
