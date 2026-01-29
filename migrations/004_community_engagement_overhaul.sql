-- Migration 004: Community Engagement Overhaul
-- Adds verified voter fields, notification preferences, Other option support, display names

-- 1. Extend verified_voters with name fields
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS last_initial TEXT;

-- 2. Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  email_on_comment_moderation BOOLEAN DEFAULT true,
  email_on_new_comment BOOLEAN DEFAULT true,
  email_on_new_reply BOOLEAN DEFAULT true,
  email_on_weekly_digest BOOLEAN DEFAULT true,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_email ON notification_preferences(email);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_supporter ON notification_preferences(supporter_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_token ON notification_preferences(unsubscribe_token);

-- 3. Poll "Other" option support
ALTER TABLE poll_choices ADD COLUMN IF NOT EXISTS is_other_option BOOLEAN DEFAULT false;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS other_text TEXT;

-- 4. Display name on comments
ALTER TABLE comments ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 5. Supporter ID on ideas (for restricting to registered users)
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS supporter_id UUID REFERENCES supporters(id);

-- 6. Ensure audit_logs has target fields (may already exist)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_id UUID;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS target_type TEXT;
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_id, target_type);
