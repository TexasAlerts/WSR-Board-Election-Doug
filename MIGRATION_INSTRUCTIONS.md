# Anonymous Voting Database Migration Instructions

## ⚠️ Action Required

The anonymous voting backend code is complete and deployed, but the database schema needs to be updated to enable the feature.

## Option 1: Run in Supabase SQL Editor (Recommended - 2 minutes)

1. Go to https://ysoypphpoacvcluqvscx.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the SQL below
5. Click "Run" or press Cmd+Enter

```sql
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

-- Add column comments for documentation
COMMENT ON COLUMN poll_votes.anonymous_voter_token IS 'Random token stored in browser cookie for anonymous vote tracking';
COMMENT ON COLUMN poll_votes.anonymous_voter_fingerprint IS 'SHA-256 hash of IP + User-Agent for additional duplicate prevention';
```

## Option 2: Verify Migration Success

After running the SQL, verify the migration worked:

```bash
node verify-and-migrate.mjs
```

Expected output:
```
anonymous_voter_token column: ✅ EXISTS
anonymous_voter_fingerprint column: ✅ EXISTS

✅ Database is ready for anonymous voting!
```

## What This Migration Does

1. **Adds `anonymous_voter_token` column** - Stores 32-character random token from browser cookie
2. **Adds `anonymous_voter_fingerprint` column** - Stores SHA-256 hash of IP + User-Agent
3. **Makes `voter_email` nullable** - Allows votes without email for anonymous voters
4. **Creates indexes** - Enables fast duplicate vote checking for anonymous voters
5. **Adds check constraint** - Ensures every vote has at least one identifier (supporter_id OR email OR both anonymous fields)

## After Migration

Once the migration is complete, anonymous voting will be fully functional:

- ✅ Backend API ready (`src/app/api/polls/[id]/vote/route.js`)
- ✅ Utility functions ready (`src/lib/anonymousVoting.js`)
- ✅ Database schema updated (after running SQL above)
- ⏳ Frontend integration needed (see ANONYMOUS_VOTING_IMPLEMENTATION.md)

## Security

- **Two-factor duplicate prevention**: Cookie token + IP fingerprint
- **HttpOnly cookies**: Cannot be accessed by JavaScript (XSS protection)
- **1-year expiration**: Persistent across browser sessions
- **Moderate security**: Balances accessibility with fraud prevention

## Rollback

If you need to rollback the migration:

```sql
-- Remove anonymous voting columns
ALTER TABLE poll_votes DROP COLUMN IF EXISTS anonymous_voter_token;
ALTER TABLE poll_votes DROP COLUMN IF EXISTS anonymous_voter_fingerprint;

-- Make voter_email required again
ALTER TABLE poll_votes ALTER COLUMN voter_email SET NOT NULL;

-- Drop indexes
DROP INDEX IF EXISTS idx_poll_votes_anonymous_token;
DROP INDEX IF EXISTS idx_poll_votes_anonymous_fingerprint;

-- Drop check constraint
ALTER TABLE poll_votes DROP CONSTRAINT IF EXISTS poll_votes_has_identifier;
```

## Questions?

See `ANONYMOUS_VOTING_IMPLEMENTATION.md` for complete documentation including:
- Three-tier voting system explanation
- Frontend integration examples
- Testing checklist
- Security considerations
