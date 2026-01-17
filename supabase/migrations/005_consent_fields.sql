-- Migration: Add consent fields to interest and endorsements tables
-- Date: 2026-01-17
-- Purpose: Store email/SMS consent preferences from form submissions

-- Add consent fields to interest table
ALTER TABLE interest ADD COLUMN IF NOT EXISTS consent_email BOOLEAN DEFAULT false;
ALTER TABLE interest ADD COLUMN IF NOT EXISTS consent_sms BOOLEAN DEFAULT false;

-- Add phone and consent fields to endorsements table
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS consent_email BOOLEAN DEFAULT false;
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS consent_sms BOOLEAN DEFAULT false;

-- Add index for consent-based queries (for broadcasting)
CREATE INDEX IF NOT EXISTS idx_interest_consent_email ON interest(consent_email) WHERE consent_email = true;
CREATE INDEX IF NOT EXISTS idx_interest_consent_sms ON interest(consent_sms) WHERE consent_sms = true;
CREATE INDEX IF NOT EXISTS idx_endorsements_consent_email ON endorsements(consent_email) WHERE consent_email = true;
CREATE INDEX IF NOT EXISTS idx_endorsements_consent_sms ON endorsements(consent_sms) WHERE consent_sms = true;
