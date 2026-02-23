-- Migration 023: Fix Supabase Database Linter Security Issues
-- Resolves 1 ERROR and 6 WARNINGS from Supabase database linter
--
-- ERROR: poll_vote_counts view uses SECURITY DEFINER (bypasses RLS of querying user)
-- WARN:  6 functions missing search_path (vulnerable to search_path manipulation)

-- ============================================
-- FIX 1: poll_vote_counts SECURITY DEFINER view
-- Change from SECURITY DEFINER to SECURITY INVOKER
-- ============================================

-- Recreate the view without SECURITY DEFINER
-- (Views default to SECURITY INVOKER, which respects the querying user's permissions)
DROP VIEW IF EXISTS poll_vote_counts;

CREATE VIEW poll_vote_counts
WITH (security_invoker = true) AS
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

-- Re-grant SELECT permissions
GRANT SELECT ON poll_vote_counts TO anon;
GRANT SELECT ON poll_vote_counts TO authenticated;

COMMENT ON VIEW poll_vote_counts IS 'Secure aggregated view of poll votes - exposes only counts, not PII. Uses SECURITY INVOKER.';

-- ============================================
-- FIX 2: Set search_path on all 6 functions
-- Prevents search_path manipulation attacks
-- ============================================

-- 2a. increment_session_stats
CREATE OR REPLACE FUNCTION increment_session_stats(
  p_session_id UUID,
  p_is_page_view BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.visitor_sessions
  SET
    page_view_count = CASE WHEN p_is_page_view THEN page_view_count + 1 ELSE page_view_count END,
    action_count = action_count + 1,
    last_activity_at = NOW()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2b. cleanup_anonymous_sessions
CREATE OR REPLACE FUNCTION cleanup_anonymous_sessions()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.visitor_sessions
    WHERE supporter_id IS NULL
      AND created_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2c. cleanup_session_activities
CREATE OR REPLACE FUNCTION cleanup_session_activities()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.session_activities sa
    WHERE sa.created_at < NOW() - INTERVAL '90 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.visitor_sessions vs
        WHERE vs.id = sa.visitor_session_id
          AND vs.supporter_id IS NOT NULL
      )
    RETURNING sa.id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  -- Also cleanup very old authenticated sessions (365 days)
  DELETE FROM public.session_activities
  WHERE created_at < NOW() - INTERVAL '365 days';

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2d. cleanup_donation_events
CREATE OR REPLACE FUNCTION cleanup_donation_events()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.donation_events
    WHERE created_at < NOW() - INTERVAL '180 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2e. run_data_retention_cleanup
CREATE OR REPLACE FUNCTION run_data_retention_cleanup()
RETURNS TABLE (
  anonymous_sessions_deleted INTEGER,
  session_activities_deleted INTEGER,
  donation_events_deleted INTEGER
) AS $$
DECLARE
  sessions_deleted INTEGER;
  activities_deleted INTEGER;
  donations_deleted INTEGER;
BEGIN
  SELECT public.cleanup_anonymous_sessions() INTO sessions_deleted;
  SELECT public.cleanup_session_activities() INTO activities_deleted;
  SELECT public.cleanup_donation_events() INTO donations_deleted;

  RETURN QUERY SELECT sessions_deleted, activities_deleted, donations_deleted;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2f. update_polls_updated_at
CREATE OR REPLACE FUNCTION update_polls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
