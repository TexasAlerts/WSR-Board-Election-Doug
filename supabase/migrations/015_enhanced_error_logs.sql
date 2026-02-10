-- Migration 015: Enhanced Error Logs
-- Adds severity levels, correlation IDs, latency tracking, and visitor session linking

-- Add severity level for error prioritization
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium'
  CHECK (severity IN ('critical', 'high', 'medium', 'low'));

-- Add correlation ID for request tracing across services
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS correlation_id UUID;

-- Add latency tracking to identify slow operations
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS latency_ms INTEGER;

-- Add visitor session ID for session reconstruction
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS visitor_session_id UUID;

-- Index for filtering by severity (high-priority queries)
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);

-- Index for correlation ID lookups
CREATE INDEX IF NOT EXISTS idx_error_logs_correlation ON error_logs(correlation_id);

-- Index for visitor session lookups
CREATE INDEX IF NOT EXISTS idx_error_logs_visitor_session ON error_logs(visitor_session_id);
