-- Migration 020: Data Retention Functions
-- Cleanup functions for privacy compliance and database hygiene

-- Helper function to increment session stats
CREATE OR REPLACE FUNCTION increment_session_stats(
  p_session_id UUID,
  p_is_page_view BOOLEAN DEFAULT false
)
RETURNS VOID AS $$
BEGIN
  UPDATE visitor_sessions
  SET
    page_view_count = CASE WHEN p_is_page_view THEN page_view_count + 1 ELSE page_view_count END,
    action_count = action_count + 1,
    last_activity_at = NOW()
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Cleanup anonymous sessions older than 90 days
CREATE OR REPLACE FUNCTION cleanup_anonymous_sessions()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM visitor_sessions
    WHERE supporter_id IS NULL
      AND created_at < NOW() - INTERVAL '90 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old session activities
-- Anonymous: 90 days, Authenticated: 365 days
CREATE OR REPLACE FUNCTION cleanup_session_activities()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM session_activities sa
    WHERE sa.created_at < NOW() - INTERVAL '90 days'
      AND NOT EXISTS (
        SELECT 1 FROM visitor_sessions vs
        WHERE vs.id = sa.visitor_session_id
          AND vs.supporter_id IS NOT NULL
      )
    RETURNING sa.id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  -- Also cleanup very old authenticated sessions (365 days)
  DELETE FROM session_activities
  WHERE created_at < NOW() - INTERVAL '365 days';

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old donation events (180 days for funnel analytics)
CREATE OR REPLACE FUNCTION cleanup_donation_events()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM donation_events
    WHERE created_at < NOW() - INTERVAL '180 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Master cleanup function that calls all cleanup functions
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
  SELECT cleanup_anonymous_sessions() INTO sessions_deleted;
  SELECT cleanup_session_activities() INTO activities_deleted;
  SELECT cleanup_donation_events() INTO donations_deleted;

  RETURN QUERY SELECT sessions_deleted, activities_deleted, donations_deleted;
END;
$$ LANGUAGE plpgsql;
