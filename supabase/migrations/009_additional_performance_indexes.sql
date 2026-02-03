-- Migration 009: Additional performance indexes
-- Addresses query patterns identified in comprehensive audit

-- Ideas: sorting by created_at
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at DESC);

-- Ideas: composite for common filtered + sorted queries
CREATE INDEX IF NOT EXISTS idx_ideas_status_created ON ideas(status, created_at DESC);

-- Interest: filtering by type
CREATE INDEX IF NOT EXISTS idx_interest_type ON interest(type);

-- Error logs: ORDER BY last_occurred_at (used in admin dashboard)
CREATE INDEX IF NOT EXISTS idx_error_logs_last_occurred ON error_logs(last_occurred_at DESC);

-- Comments: composite for status + poll/idea filtered queries
CREATE INDEX IF NOT EXISTS idx_comments_status_created ON comments(status, created_at DESC);

-- Endorsements: composite for status + date sorting
CREATE INDEX IF NOT EXISTS idx_endorsements_status_created ON endorsements(status, created_at DESC);

-- Notification preferences: email lookup for RLS
CREATE INDEX IF NOT EXISTS idx_notification_prefs_email ON notification_preferences(email);

-- Questions: status filtering + date sorting
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_status_created ON questions(status, created_at DESC);

-- Supporters: composite for status + date sorting (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_supporters_status_created ON supporters(status, created_at DESC);

-- Broadcasts: sent_by for admin queries
CREATE INDEX IF NOT EXISTS idx_broadcasts_sent_by ON broadcasts(sent_by);
CREATE INDEX IF NOT EXISTS idx_broadcasts_sent_at ON broadcasts(sent_at DESC);

-- Sessions: expires_at for cleanup queries (already has idx_sessions_expires in 008)
-- Thread subscriptions: supporter lookups
CREATE INDEX IF NOT EXISTS idx_thread_subs_supporter ON thread_subscriptions(supporter_id);
CREATE INDEX IF NOT EXISTS idx_thread_subs_poll ON thread_subscriptions(poll_id) WHERE poll_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_thread_subs_idea ON thread_subscriptions(idea_id) WHERE idea_id IS NOT NULL;
