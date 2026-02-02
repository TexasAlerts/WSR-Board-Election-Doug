-- Anonymous Voting Migration
-- Add columns to poll_votes table to support anonymous voting

-- Add anonymous voter tracking columns
ALTER TABLE poll_votes
ADD COLUMN IF NOT EXISTS anonymous_voter_token VARCHAR(32),
ADD COLUMN IF NOT EXISTS anonymous_voter_fingerprint VARCHAR(64);

-- Create index for duplicate vote checking on anonymous votes
CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_token
ON poll_votes(poll_id, anonymous_voter_token)
WHERE anonymous_voter_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_fingerprint
ON poll_votes(poll_id, anonymous_voter_fingerprint)
WHERE anonymous_voter_fingerprint IS NOT NULL;

-- Make voter_email nullable to allow truly anonymous votes
ALTER TABLE poll_votes ALTER COLUMN voter_email DROP NOT NULL;

-- Add check constraint to ensure at least one identifier exists
ALTER TABLE poll_votes
ADD CONSTRAINT poll_votes_has_identifier
CHECK (
  supporter_id IS NOT NULL
  OR voter_email IS NOT NULL
  OR (anonymous_voter_token IS NOT NULL AND anonymous_voter_fingerprint IS NOT NULL)
);

-- Update existing votes to ensure they pass the check
-- (All existing votes should have supporter_id or voter_email)

COMMENT ON COLUMN poll_votes.anonymous_voter_token IS 'Random token stored in browser cookie for anonymous vote tracking';
COMMENT ON COLUMN poll_votes.anonymous_voter_fingerprint IS 'SHA-256 hash of IP + User-Agent for additional duplicate prevention';
