-- Migration 017: Session Activities Table
-- Tracks individual actions within a visitor session
-- Enables "What did this user do before the error?" reconstruction

CREATE TABLE IF NOT EXISTS session_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to visitor session
  visitor_session_id UUID REFERENCES visitor_sessions(id) ON DELETE CASCADE,

  -- Activity classification
  activity_type TEXT NOT NULL,    -- 'page_view', 'poll_vote', 'donation_click', 'error', etc.
  activity_subtype TEXT,          -- Additional classification (e.g., 'amount_selected' for donation)

  -- Target information
  target_type TEXT,               -- 'poll', 'idea', 'donation', 'page', etc.
  target_id UUID,                 -- ID of the target entity
  target_name TEXT,               -- Human-readable name for quick reference

  -- Page context
  page_url TEXT,
  page_title TEXT,

  -- Request tracing
  correlation_id UUID,            -- Links to error_logs and audit_logs
  request_method TEXT,
  request_path TEXT,
  response_status INTEGER,
  latency_ms INTEGER,

  -- Additional context
  details JSONB,                  -- Flexible field for activity-specific data

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for session timeline reconstruction
CREATE INDEX IF NOT EXISTS idx_session_activities_session ON session_activities(visitor_session_id);

-- Index for activity type queries
CREATE INDEX IF NOT EXISTS idx_session_activities_type ON session_activities(activity_type);

-- Index for correlation lookups
CREATE INDEX IF NOT EXISTS idx_session_activities_correlation ON session_activities(correlation_id);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_session_activities_created ON session_activities(created_at DESC);

-- Enable RLS
ALTER TABLE session_activities ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access to session_activities" ON session_activities
  FOR ALL USING (true) WITH CHECK (true);
