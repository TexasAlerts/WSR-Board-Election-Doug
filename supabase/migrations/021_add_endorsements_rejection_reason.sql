-- Migration 021: Add rejection_reason column to endorsements table
-- Date: 2026-02-10
-- Purpose: Support admin rejection workflow for endorsements (matching questions table)

-- Add rejection_reason column to endorsements table
ALTER TABLE endorsements
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for faster filtering by rejection status
CREATE INDEX IF NOT EXISTS idx_endorsements_rejection
  ON endorsements(status, rejection_reason)
  WHERE rejection_reason IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN endorsements.rejection_reason IS 'Reason provided by admin when rejecting an endorsement';
