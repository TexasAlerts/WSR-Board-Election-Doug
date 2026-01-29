-- Migration 005: Add per-channel notification preferences (email + SMS)
-- Extends notification_preferences with SMS columns and new email notification types

-- New email notification types
ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS email_on_new_poll BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_on_broadcast BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_on_system BOOLEAN DEFAULT true;

-- SMS notification channels (all default to true, matching email defaults)
ALTER TABLE notification_preferences
  ADD COLUMN IF NOT EXISTS sms_on_new_poll BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_on_comment_activity BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_on_new_idea BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_on_broadcast BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS sms_on_system BOOLEAN DEFAULT true;
