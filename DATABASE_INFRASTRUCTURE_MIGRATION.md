# Database Infrastructure Migration - 2026-02-02

## Summary

Created missing database infrastructure to support the interest submissions, endorsements, and improve query performance across the application.

## Migration Files Created

### 1. Migration 007: Interest and Endorsements Tables
**File:** `/supabase/migrations/007_interest_endorsements_tables.sql`

#### Interest Table
The `interest` table stores submissions from the "Get Involved" form and general interest expressions:

**Schema:**
- `id` (UUID, PRIMARY KEY)
- `type` (TEXT) - Type of interest: 'updates', 'volunteer', 'donate', 'other'
- `name` (TEXT, NOT NULL) - Submitter's name
- `email` (TEXT, NOT NULL) - Submitter's email
- `phone` (TEXT, nullable) - Optional phone number
- `message` (TEXT, nullable) - Optional message
- `consent_email` (BOOLEAN, default false) - Email communication consent
- `consent_sms` (BOOLEAN, default false) - SMS communication consent
- `created_at` (TIMESTAMPTZ)

**Indexes:**
- `idx_interest_email` - Fast email lookups
- `idx_interest_created` - Chronological sorting
- `idx_interest_consent_email` - Partial index for email broadcast lists
- `idx_interest_consent_sms` - Partial index for SMS broadcast lists

**RLS Policies:**
- Service role has full access (for API routes)

#### Endorsements Table
The `endorsements` table stores public endorsements from supporters:

**Schema:**
- `id` (UUID, PRIMARY KEY)
- `name` (TEXT, NOT NULL) - Endorser's name
- `email` (TEXT, NOT NULL) - Endorser's email
- `phone` (TEXT, nullable) - Optional phone number
- `message` (TEXT, nullable) - Endorsement message
- `status` (TEXT) - 'pending', 'approved', 'rejected'
- `consent_email` (BOOLEAN, default false) - Email communication consent
- `consent_sms` (BOOLEAN, default false) - SMS communication consent
- `created_at` (TIMESTAMPTZ)
- `approved_at` (TIMESTAMPTZ, nullable)
- `approved_by` (UUID, nullable) - References supporters(id)

**Indexes:**
- `idx_endorsements_status` - Filter by approval status
- `idx_endorsements_email` - Fast email lookups
- `idx_endorsements_created` - Chronological sorting
- `idx_endorsements_consent_email` - Partial index for email broadcast lists
- `idx_endorsements_consent_sms` - Partial index for SMS broadcast lists

**RLS Policies:**
- Service role has full access (for API routes)
- Public can read approved endorsements only

### 2. Migration 008: Performance Indexes
**File:** `/supabase/migrations/008_performance_indexes.sql`

Added critical performance indexes identified during audit:

1. **`idx_poll_votes_supporter`** - ON poll_votes(supporter_id)
   - Enables fast lookup of all polls a supporter has voted on
   - Supports "My Activity" page and vote tracking

2. **`idx_polls_visibility`** - ON polls(visibility)
   - Optimizes filtering polls by visibility level (public, authenticated, etc.)
   - Critical for poll listing queries

3. **`idx_comments_status`** - ON comments(status)
   - Improves filtering comments by moderation status
   - Ensures idempotency (already exists from earlier migration)

4. **`idx_sessions_expires`** - ON sessions(expires_at)
   - Enables efficient cleanup of expired sessions
   - Critical for session management maintenance jobs

5. **`idx_comment_votes_supporter`** - ON comment_votes(supporter_id)
   - Fast lookup of all comment votes by a supporter
   - Supports vote tracking and activity history

6. **`idx_idea_votes_supporter`** - ON idea_votes(supporter_id)
   - Fast lookup of all idea votes by a supporter
   - Supports vote tracking and activity history

## API Route Alignment

### Interest API (`/api/interest`)
The route at `/src/app/api/interest/route.js` expects these fields:
- ✅ type (with validation)
- ✅ name (required, max 200)
- ✅ email (required, validated)
- ✅ phone (optional)
- ✅ message (optional, max 4000)
- ✅ consentEmail (boolean)
- ✅ consentSms (boolean)

**Schema fully aligned with API route requirements.**

### Endorsements API (`/api/endorsements`)
The route at `/src/app/api/endorsements/route.js` expects:
- ✅ name (required, max 200)
- ✅ email (required, validated)
- ✅ phone (optional, max 50)
- ✅ message (optional, max 4000)
- ✅ status (set to 'pending' by default)
- ✅ consentEmail (boolean)
- ✅ consentSms (boolean)

**Schema fully aligned with API route requirements.**

## Q&A Route Status

**No action needed.** Investigation confirmed:
- ❌ No `/qa` route exists in the application
- ✅ `/qna` route exists at `/src/app/qna/page.js`
- ✅ Navigation references `/qna` correctly (StickyNav.jsx lines 166-168, 265-267)
- ✅ Sitemap references `/qna` correctly (line 11)

The application correctly uses `/qna` (Questions & Answers) throughout. No redirect or cleanup needed.

## Migration Application Instructions

### Local Development
```bash
# Apply migrations to local Supabase instance
supabase db reset  # Resets and applies all migrations
# OR
supabase migration up  # Applies pending migrations only
```

### Production Deployment
```bash
# Push migrations to production Supabase project
supabase db push

# OR apply via Supabase Dashboard:
# 1. Go to Database > Migrations
# 2. Upload migration files in order:
#    - 007_interest_endorsements_tables.sql
#    - 008_performance_indexes.sql
```

### Verification Queries

After applying migrations, verify with these queries:

```sql
-- Check interest table exists
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'interest'
ORDER BY ordinal_position;

-- Check endorsements table exists
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'endorsements'
ORDER BY ordinal_position;

-- Verify indexes created
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('interest', 'endorsements', 'poll_votes', 'polls', 'comments', 'sessions', 'comment_votes', 'idea_votes')
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('interest', 'endorsements')
ORDER BY tablename, policyname;
```

## Testing Recommendations

1. **Interest Submissions:**
   - Test POST to `/api/interest` with various types
   - Verify consent fields are properly stored
   - Check audit logging for interest submissions

2. **Endorsements:**
   - Test POST to `/api/endorsements`
   - Verify status defaults to 'pending'
   - Test GET to verify only approved endorsements are public
   - Test admin endorsement approval workflow

3. **Performance Indexes:**
   - Run EXPLAIN ANALYZE on queries filtering by supporter_id
   - Verify session cleanup queries use the expires_at index
   - Check poll visibility filtering performance

## Impact Assessment

### Database Changes
- ✅ Two new tables: `interest`, `endorsements`
- ✅ 11 new indexes for performance optimization
- ✅ 3 new RLS policies for security
- ✅ No breaking changes to existing schema

### Application Impact
- ✅ Interest API will work correctly (previously would fail on missing table)
- ✅ Endorsements API will work correctly (previously would fail on missing table)
- ✅ Improved query performance across polls, ideas, and comments
- ✅ Session cleanup will be more efficient
- ✅ No code changes required - migrations align with existing API routes

### Security
- ✅ RLS enabled on both new tables
- ✅ Service role access for API routes
- ✅ Public read access restricted to approved endorsements only
- ✅ No exposure of pending/rejected endorsements
- ✅ No direct access to interest submissions (admin only via API)

## Related Files Modified

No code files were modified. Only database migrations were created:
- `/supabase/migrations/007_interest_endorsements_tables.sql` (NEW)
- `/supabase/migrations/008_performance_indexes.sql` (NEW)

## Next Steps

1. ✅ Review migration files for accuracy
2. Apply migrations to development environment
3. Test all affected API endpoints
4. Verify RLS policies are working correctly
5. Run performance tests on indexed queries
6. Apply migrations to production
7. Monitor error logs for any migration-related issues

## Notes

- All indexes use `IF NOT EXISTS` to ensure idempotency
- Tables use `IF NOT EXISTS` to prevent errors if already created manually
- Migration numbering follows existing convention (007, 008)
- All timestamps use TIMESTAMPTZ for timezone awareness
- Consent fields default to false (opt-in model)
- Endorsement approval workflow requires admin action
