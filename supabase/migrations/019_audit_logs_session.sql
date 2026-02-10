-- Migration 019: Audit Logs Session Link
-- Links audit logs to visitor sessions for session reconstruction

-- Add visitor session ID
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS visitor_session_id UUID;

-- Add correlation ID for request tracing
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS correlation_id UUID;

-- Index for session-based audit log lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_visitor_session ON audit_logs(visitor_session_id);

-- Index for correlation-based lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON audit_logs(correlation_id);
