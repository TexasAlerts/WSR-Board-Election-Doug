-- Migration 012: Fix interest table action_type constraint
-- Date: 2026-02-07
-- Purpose: Update CHECK constraint to match API accepted values

-- Drop existing constraint if it exists
ALTER TABLE interest DROP CONSTRAINT IF EXISTS interest_type_check;

-- Add updated constraint with all valid action types
-- Matches values accepted by /api/interest endpoint:
-- 'volunteer', 'yard_sign', 'host_event', 'donate', 'updates', 'other'
ALTER TABLE interest ADD CONSTRAINT interest_type_check
  CHECK (type IN ('updates', 'volunteer', 'donate', 'other', 'yard_sign', 'host_event'));

-- Note: This migration is idempotent and safe to run multiple times
