-- Migration: Add email verification tracking to interest and questions tables
-- This enables linking submissions to verified_voters for notification purposes

-- Add verification columns to interest table
ALTER TABLE interest
  ADD COLUMN IF NOT EXISTS verified_voter_id UUID REFERENCES verified_voters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'bounced'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_interest_verified_voter ON interest(verified_voter_id);
CREATE INDEX IF NOT EXISTS idx_interest_verification_status ON interest(verification_status);

-- Add verification columns to questions table
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS verified_voter_id UUID REFERENCES verified_voters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'bounced')),
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_verified_voter ON questions(verified_voter_id);
CREATE INDEX IF NOT EXISTS idx_questions_verification_status ON questions(verification_status);
CREATE INDEX IF NOT EXISTS idx_questions_notified ON questions(notified_at);

-- Note: All columns are optional with defaults for backward compatibility
-- Existing records will have verification_status='pending' and verified_voter_id=NULL
