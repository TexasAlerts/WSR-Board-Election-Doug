-- Comprehensive Logging System Migration
-- Includes audit logs enhancement and error tracking

-- ============================================
-- ERROR TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL, -- 'api_error', 'client_error', 'server_error', 'validation_error'
  error_message TEXT NOT NULL,
  error_stack TEXT,
  endpoint TEXT, -- API route or page that generated the error
  method TEXT, -- HTTP method (GET, POST, etc.)
  request_body JSONB, -- Sanitized request body (no passwords)
  user_id UUID REFERENCES supporters(id),
  user_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'wont_fix')),
  assigned_to UUID REFERENCES supporters(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES supporters(id),
  notified_at TIMESTAMPTZ,
  occurrence_count INTEGER DEFAULT 1,
  first_occurred_at TIMESTAMPTZ DEFAULT NOW(),
  last_occurred_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ENHANCE AUDIT LOGS TABLE
-- ============================================
-- Add more fields to existing audit_logs if they don't exist
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_method TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_path TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS request_body JSONB;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS response_status INTEGER;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_id UUID; -- ID of affected resource
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_type TEXT; -- 'supporter', 'comment', 'poll', etc.
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values JSONB; -- Previous values before change
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB; -- New values after change
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id UUID;

-- ============================================
-- INDEXES FOR LOGGING
-- ============================================
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON error_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_endpoint ON error_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_path ON audit_logs(request_path);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to error_logs" ON error_logs
  FOR ALL USING (true) WITH CHECK (true);
