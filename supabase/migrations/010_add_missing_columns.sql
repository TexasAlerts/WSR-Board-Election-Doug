-- Migration: Add missing columns to various tables
-- Date: 2026-02-06
-- Purpose: Fix database schema to match application code expectations

-- 1. Add updated_at column to polls table
ALTER TABLE polls ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at on polls
CREATE OR REPLACE FUNCTION update_polls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS polls_updated_at_trigger ON polls;
CREATE TRIGGER polls_updated_at_trigger
    BEFORE UPDATE ON polls
    FOR EACH ROW
    EXECUTE FUNCTION update_polls_updated_at();

-- 2. Add rejection_reason column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 3. Add rejection_reason column to endorsements table
ALTER TABLE endorsements ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Add suspended_at column to verified_voters table
ALTER TABLE verified_voters ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Add index for efficient filtering by suspension status
CREATE INDEX IF NOT EXISTS idx_verified_voters_suspended_at ON verified_voters(suspended_at);

-- Update existing polls to have updated_at = created_at if null
UPDATE polls SET updated_at = created_at WHERE updated_at IS NULL;
