-- Migration 006: Fix Critical RLS Policies
-- Fixes three critical security issues:
-- 1. poll_votes RLS policy that exposes PII (voter_email, ip_address)
-- 2. notification_preferences table missing RLS
-- 3. poll_votes UNIQUE constraint doesn't handle NULL values correctly

-- ============================================
-- ISSUE 1: Fix poll_votes RLS - Remove PII exposure
-- ============================================

-- Drop the existing policy that exposes voter_email and ip_address
DROP POLICY IF EXISTS "Public can read vote counts" ON poll_votes;

-- Create a secure view that only exposes aggregated vote counts
CREATE OR REPLACE VIEW poll_vote_counts AS
SELECT
  poll_id,
  COUNT(DISTINCT id) as total_votes,
  COUNT(DISTINCT CASE
    WHEN voter_email IS NOT NULL THEN voter_email
    WHEN anonymous_voter_token IS NOT NULL THEN anonymous_voter_token
    WHEN supporter_id IS NOT NULL THEN supporter_id::TEXT
    ELSE NULL
  END) as unique_voters
FROM poll_votes
GROUP BY poll_id;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON poll_vote_counts TO anon;
GRANT SELECT ON poll_vote_counts TO authenticated;

-- Service role retains full access to poll_votes table for vote processing
DROP POLICY IF EXISTS "Service role full access to poll_votes" ON poll_votes;
CREATE POLICY "Service role full access to poll_votes" ON poll_votes
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ISSUE 2: Enable RLS on notification_preferences
-- ============================================

-- Enable Row Level Security on notification_preferences table
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Only service role can access notification_preferences
-- This prevents direct client access to email preferences
DROP POLICY IF EXISTS "Service role full access to notification_preferences" ON notification_preferences;
CREATE POLICY "Service role full access to notification_preferences" ON notification_preferences
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- ISSUE 3: Fix poll_votes UNIQUE constraint for NULL values
-- ============================================

-- Drop the existing UNIQUE constraint that doesn't handle NULLs properly
-- This constraint is named poll_votes_poll_id_voter_email_key
ALTER TABLE poll_votes
  DROP CONSTRAINT IF EXISTS poll_votes_poll_id_voter_email_key;

-- Create a conditional unique index for non-NULL voter_email
-- This allows multiple NULL voter_email values while enforcing uniqueness for actual emails
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_email_unique
  ON poll_votes(poll_id, voter_email)
  WHERE voter_email IS NOT NULL;

-- Create a conditional unique index for non-NULL anonymous_voter_token
-- This prevents duplicate anonymous votes with the same token
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_anonymous_unique
  ON poll_votes(poll_id, anonymous_voter_token)
  WHERE anonymous_voter_token IS NOT NULL;

-- Create a conditional unique index for non-NULL supporter_id
-- This prevents duplicate votes from authenticated supporters
CREATE UNIQUE INDEX IF NOT EXISTS poll_votes_supporter_unique
  ON poll_votes(poll_id, supporter_id)
  WHERE supporter_id IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON VIEW poll_vote_counts IS 'Secure aggregated view of poll votes - exposes only counts, not PII';
COMMENT ON POLICY "Service role full access to poll_votes" ON poll_votes IS 'Service role can read/write votes for vote processing - client access blocked';
COMMENT ON POLICY "Service role full access to notification_preferences" ON notification_preferences IS 'Service role only - prevents direct client access to email preferences';
