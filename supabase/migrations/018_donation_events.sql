-- Migration 018: Donation Events Table
-- Tracks donation funnel for understanding drop-offs before Anedot redirect
-- Events: page_view -> amount_selected -> donate_clicked

CREATE TABLE IF NOT EXISTS donation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session and user linking
  visitor_session_id UUID REFERENCES visitor_sessions(id) ON DELETE SET NULL,
  supporter_id UUID REFERENCES supporters(id) ON DELETE SET NULL,

  -- Event type: 'page_view', 'amount_selected', 'donate_clicked'
  event_type TEXT NOT NULL,

  -- Donation details
  selected_amount INTEGER,        -- Amount in cents (e.g., 2500 = $25)
  is_custom_amount BOOLEAN DEFAULT false,
  anedot_redirect_url TEXT,       -- Captured before redirect for tracking

  -- Device info
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  referrer TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for session-based funnel analysis
CREATE INDEX IF NOT EXISTS idx_donation_events_session ON donation_events(visitor_session_id);

-- Index for supporter donation history
CREATE INDEX IF NOT EXISTS idx_donation_events_supporter ON donation_events(supporter_id);

-- Index for funnel analysis by event type
CREATE INDEX IF NOT EXISTS idx_donation_events_type ON donation_events(event_type);

-- Index for time-based reporting
CREATE INDEX IF NOT EXISTS idx_donation_events_created ON donation_events(created_at DESC);

-- Enable RLS
ALTER TABLE donation_events ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access to donation_events" ON donation_events
  FOR ALL USING (true) WITH CHECK (true);
