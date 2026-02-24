-- Site settings table for feature toggles (e.g., donations)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default: donations disabled
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES ('donations_enabled', 'false', 'Controls whether donation functionality is shown on the site')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (public config)
CREATE POLICY "Anyone can read site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- No direct updates via anon/authenticated roles (service role bypasses RLS)
CREATE POLICY "No public updates to site_settings"
  ON site_settings FOR UPDATE
  USING (false)
  WITH CHECK (false);
