-- Migration 011: Complete Schema Fix
-- Date: 2026-02-06
-- Purpose: Fix ALL database schema mismatches between code and database
-- This migration consolidates fixes for missing tables and columns that were
-- either never created or were in migrations that didn't run (wrong directory)

-- ============================================
-- 1. CREATE QUESTIONS TABLE (completely missing)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_email ON questions(email);
CREATE INDEX IF NOT EXISTS idx_questions_status_created ON questions(status, created_at DESC);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to questions" ON questions;
CREATE POLICY "Service role full access to questions" ON questions
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read answered questions" ON questions;
CREATE POLICY "Public can read answered questions" ON questions
  FOR SELECT USING (status = 'approved' AND answer IS NOT NULL);

-- ============================================
-- 2. ADD voter_email TO comment_votes
-- ============================================
ALTER TABLE comment_votes ADD COLUMN IF NOT EXISTS voter_email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS comment_votes_email_unique
  ON comment_votes(comment_id, voter_email)
  WHERE voter_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_comment_votes_voter_email
  ON comment_votes(voter_email)
  WHERE voter_email IS NOT NULL;

-- ============================================
-- 3. ADD MISSING COLUMNS TO verified_voters
-- ============================================
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS last_initial TEXT;
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_verified_voters_suspended_at ON verified_voters(suspended_at);

-- ============================================
-- 4. ADD updated_at TO polls WITH TRIGGER
-- ============================================
ALTER TABLE polls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION update_polls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS polls_updated_at_trigger ON polls;
CREATE TRIGGER polls_updated_at_trigger
    BEFORE UPDATE ON polls
    FOR EACH ROW
    EXECUTE FUNCTION update_polls_updated_at();

UPDATE polls SET updated_at = created_at WHERE updated_at IS NULL;

-- ============================================
-- 5. ADD rejection_reason TO endorsements
-- ============================================
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================
-- 6. ENSURE poll_choices HAS is_other_option
-- (From 004_community_engagement_overhaul.sql that may not have run)
-- ============================================
ALTER TABLE poll_choices ADD COLUMN IF NOT EXISTS is_other_option BOOLEAN DEFAULT false;

-- ============================================
-- 7. ENSURE poll_votes HAS other_text AND anonymous columns
-- ============================================
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS other_text TEXT;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS anonymous_voter_token VARCHAR(32);
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS anonymous_voter_fingerprint VARCHAR(64);

-- Make voter_email nullable for anonymous votes
DO $$
BEGIN
  ALTER TABLE poll_votes ALTER COLUMN voter_email DROP NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_token
  ON poll_votes(poll_id, anonymous_voter_token)
  WHERE anonymous_voter_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_fingerprint
  ON poll_votes(poll_id, anonymous_voter_fingerprint)
  WHERE anonymous_voter_fingerprint IS NOT NULL;

-- ============================================
-- 8. ENSURE comments HAS display_name
-- ============================================
ALTER TABLE comments ADD COLUMN IF NOT EXISTS display_name TEXT;

-- ============================================
-- 9. ENSURE ideas HAS supporter_id
-- ============================================
DO $$
BEGIN
  ALTER TABLE ideas ADD COLUMN supporter_id UUID REFERENCES supporters(id);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ============================================
-- 10. ENSURE notification_preferences EXISTS
-- ============================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  email_on_comment_moderation BOOLEAN DEFAULT true,
  email_on_new_comment BOOLEAN DEFAULT true,
  email_on_new_reply BOOLEAN DEFAULT true,
  email_on_weekly_digest BOOLEAN DEFAULT true,
  email_on_new_poll BOOLEAN DEFAULT true,
  email_on_broadcast BOOLEAN DEFAULT true,
  email_on_system BOOLEAN DEFAULT true,
  sms_on_new_poll BOOLEAN DEFAULT true,
  sms_on_comment_activity BOOLEAN DEFAULT true,
  sms_on_new_idea BOOLEAN DEFAULT true,
  sms_on_broadcast BOOLEAN DEFAULT true,
  sms_on_system BOOLEAN DEFAULT true,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_email ON notification_preferences(email);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_supporter ON notification_preferences(supporter_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_token ON notification_preferences(unsubscribe_token);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to notification_preferences" ON notification_preferences;
CREATE POLICY "Service role full access to notification_preferences" ON notification_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 11. ENSURE audit_logs HAS all columns
-- ============================================
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_type TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_method TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_path TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_body JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS response_status INTEGER;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id UUID;

CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_id, target_type);
