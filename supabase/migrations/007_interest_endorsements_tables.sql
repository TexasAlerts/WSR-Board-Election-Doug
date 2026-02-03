-- Migration: Create interest and endorsements tables
-- Date: 2026-02-02
-- Purpose: Create missing tables for interest submissions and endorsements

-- ============================================
-- INTEREST TABLE
-- ============================================
-- For "Get Involved" submissions and general interest
CREATE TABLE IF NOT EXISTS interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'updates' CHECK (type IN ('updates', 'volunteer', 'donate', 'other')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  consent_email BOOLEAN DEFAULT false,
  consent_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENDORSEMENTS TABLE
-- ============================================
-- For public endorsements from supporters
CREATE TABLE IF NOT EXISTS endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  consent_email BOOLEAN DEFAULT false,
  consent_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES supporters(id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_interest_email ON interest(email);
CREATE INDEX IF NOT EXISTS idx_interest_created ON interest(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interest_consent_email ON interest(consent_email) WHERE consent_email = true;
CREATE INDEX IF NOT EXISTS idx_interest_consent_sms ON interest(consent_sms) WHERE consent_sms = true;

CREATE INDEX IF NOT EXISTS idx_endorsements_status ON endorsements(status);
CREATE INDEX IF NOT EXISTS idx_endorsements_email ON endorsements(email);
CREATE INDEX IF NOT EXISTS idx_endorsements_created ON endorsements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_endorsements_consent_email ON endorsements(consent_email) WHERE consent_email = true;
CREATE INDEX IF NOT EXISTS idx_endorsements_consent_sms ON endorsements(consent_sms) WHERE consent_sms = true;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;

-- Service role full access (used by API routes)
-- Drop existing policies if they exist to make migration idempotent
DROP POLICY IF EXISTS "Service role full access to interest" ON interest;
CREATE POLICY "Service role full access to interest" ON interest
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to endorsements" ON endorsements;
CREATE POLICY "Service role full access to endorsements" ON endorsements
  FOR ALL USING (true) WITH CHECK (true);

-- Public can read approved endorsements
DROP POLICY IF EXISTS "Public can read approved endorsements" ON endorsements;
CREATE POLICY "Public can read approved endorsements" ON endorsements
  FOR SELECT USING (status = 'approved');
