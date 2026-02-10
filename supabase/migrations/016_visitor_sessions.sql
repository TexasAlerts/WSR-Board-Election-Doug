-- Migration 016: Visitor Sessions Table
-- Tracks all visitor sessions (both anonymous and authenticated)
-- Used for session reconstruction and understanding user journeys

CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to supporter (null for anonymous visitors)
  supporter_id UUID REFERENCES supporters(id) ON DELETE SET NULL,

  -- Anonymous tracking (hashed for privacy)
  anonymous_token TEXT,           -- Session cookie token
  anonymous_fingerprint TEXT,     -- Hash of IP + User Agent for deduplication

  -- Session timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,           -- Set when session times out or user logs out

  -- Device info
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,               -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,

  -- Entry context
  entry_url TEXT,                 -- First page visited
  referrer TEXT,                  -- Where they came from

  -- UTM tracking for campaign attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Session metrics
  page_view_count INTEGER DEFAULT 0,
  action_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding sessions by supporter
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_supporter ON visitor_sessions(supporter_id);

-- Index for anonymous session lookup
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_anonymous_token ON visitor_sessions(anonymous_token);

-- Index for recent sessions
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_started ON visitor_sessions(started_at DESC);

-- Index for active session detection
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_activity ON visitor_sessions(last_activity_at DESC);

-- Enable RLS
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access to visitor_sessions" ON visitor_sessions
  FOR ALL USING (true) WITH CHECK (true);
