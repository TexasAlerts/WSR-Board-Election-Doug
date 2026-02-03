# Apply Database Migrations - Quick Reference

## New Migrations (2026-02-02)

Two new migration files have been created:
1. `007_interest_endorsements_tables.sql` - Creates interest and endorsements tables
2. `008_performance_indexes.sql` - Adds performance indexes

## Application Methods

### Option 1: Supabase CLI (Recommended)

```bash
# Ensure you're in the project directory
cd /path/to/WSR-Board-Election-Doug

# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Apply all pending migrations to production
supabase db push

# OR apply to local development
supabase db reset  # Full reset with all migrations
```

### Option 2: Supabase Dashboard

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Copy and paste the contents of each migration file:
   - First: `007_interest_endorsements_tables.sql`
   - Second: `008_performance_indexes.sql`
5. Click "Run" for each file

### Option 3: Direct SQL (Production Database)

**CAUTION:** Only use if you have direct database access and understand the risks.

```bash
# Apply migration 007
psql $DATABASE_URL < supabase/migrations/007_interest_endorsements_tables.sql

# Apply migration 008
psql $DATABASE_URL < supabase/migrations/008_performance_indexes.sql
```

## Post-Migration Verification

### 1. Check Tables Exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('interest', 'endorsements')
ORDER BY table_name;
```

Expected output:
```
 table_name
-------------
 endorsements
 interest
```

### 2. Verify Indexes
```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('interest', 'endorsements', 'poll_votes', 'polls', 'sessions', 'comment_votes', 'idea_votes')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

Should include:
- `idx_interest_email`
- `idx_interest_created`
- `idx_interest_consent_email`
- `idx_interest_consent_sms`
- `idx_endorsements_status`
- `idx_endorsements_email`
- `idx_endorsements_created`
- `idx_endorsements_consent_email`
- `idx_endorsements_consent_sms`
- `idx_poll_votes_supporter`
- `idx_polls_visibility`
- `idx_sessions_expires`
- `idx_comment_votes_supporter`
- `idx_idea_votes_supporter`

### 3. Test API Endpoints

After migrations:

```bash
# Test interest endpoint (should work now)
curl -X POST https://your-domain.com/api/interest \
  -H "Content-Type: application/json" \
  -d '{
    "type": "updates",
    "name": "Test User",
    "email": "test@example.com",
    "consentEmail": true
  }'

# Test endorsements endpoint (should work now)
curl -X POST https://your-domain.com/api/endorsements \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test endorsement",
    "consentEmail": true
  }'
```

### 4. Check RLS Policies
```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('interest', 'endorsements')
ORDER BY tablename, policyname;
```

## Rollback (If Needed)

If you need to rollback these migrations:

```sql
-- Rollback migration 008 (indexes)
DROP INDEX IF EXISTS idx_poll_votes_supporter;
DROP INDEX IF EXISTS idx_polls_visibility;
DROP INDEX IF EXISTS idx_sessions_expires;
DROP INDEX IF EXISTS idx_comment_votes_supporter;
DROP INDEX IF EXISTS idx_idea_votes_supporter;

-- Rollback migration 007 (tables)
DROP TABLE IF EXISTS endorsements CASCADE;
DROP TABLE IF EXISTS interest CASCADE;
```

**Note:** Only rollback if absolutely necessary. These migrations support existing API routes.

## Troubleshooting

### "Table already exists"
- Migrations use `IF NOT EXISTS` - this is safe and expected
- The migration will skip table creation if it already exists

### "Index already exists"
- Migrations use `IF NOT EXISTS` - this is safe and expected
- The migration will skip index creation if it already exists

### "Permission denied"
- Ensure you're using the service role key for migrations
- Check your Supabase project permissions

### API endpoints still failing
1. Verify tables were created: `SELECT * FROM interest LIMIT 1;`
2. Check RLS policies are applied
3. Verify service role key is configured in `.env`
4. Check error logs: `SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 10;`

## Migration Order

These migrations must be applied in order:
1. 001-006 (existing migrations - should already be applied)
2. **007_interest_endorsements_tables.sql** (NEW)
3. **008_performance_indexes.sql** (NEW)

## Support

For detailed information, see: `DATABASE_INFRASTRUCTURE_MIGRATION.md`
