# Clear Production Data - Instructions

## Overview

This directory contains scripts to clear all user-generated data from your production database while preserving your superuser account.

## What Gets Deleted

✅ **Will be deleted:**
- All poll votes (from all voters - authenticated, verified, anonymous)
- All comments and comment replies
- All comment votes
- All idea votes and support
- All error logs
- All audit logs (optional)
- All Q&A questions
- All endorsements
- All verified voters (except your superuser email)
- All supporters (except your superuser account)

✅ **Will be preserved:**
- Your superuser account (admin access)
- All polls (structure/questions - only votes deleted)
- All ideas (structure/content - only votes deleted)
- Poll choices (structure)

## Option 1: Run via Supabase SQL Editor (Recommended)

This is the safest method as you can review each step.

1. Open your Supabase dashboard: https://ysoypphpoacvcluqvscx.supabase.co
2. Go to **SQL Editor**
3. Open the file: `scripts/clear-production-data.sql`
4. **IMPORTANT**: First run STEP 1 to verify your superuser will be preserved:
   ```sql
   SELECT id, email, first_name, last_name, role, is_superuser
   FROM supporters
   WHERE is_superuser = true;
   ```
5. Verify this shows YOUR account
6. Run the full script or run sections individually
7. Run STEP 10 to verify cleanup

## Option 2: Run via Node.js Script

This method runs everything automatically with confirmation.

### Prerequisites

1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Set your Supabase service key as environment variable:
   ```bash
   export SUPABASE_SERVICE_KEY="your_service_role_key_here"
   ```

   Get this from: Supabase Dashboard → Settings → API → `service_role` key

### Run the Script

```bash
node scripts/clear-production-data.js
```

### What the Script Does

1. ✅ Finds and displays your superuser account
2. ✅ Shows current data counts for all tables
3. ✅ Asks for confirmation (must type "DELETE ALL DATA")
4. ✅ Deletes all data except superuser
5. ✅ Shows final counts to verify cleanup

### Sample Output

```
🧹 Production Data Cleanup Tool

🔍 Finding superuser...
✅ Found superuser: Doug Charles (doug@example.com)

📊 Current data counts:
   supporters: 15
   verified_voters: 8
   poll_votes: 42
   comments: 23
   ...

⚠️  WARNING: This will delete:
   - All poll votes
   - All comments and replies
   ...

   PRESERVED: doug@example.com (superuser)

Type "DELETE ALL DATA" to proceed: DELETE ALL DATA

🗑️  Clearing data...

Clearing poll_votes...
Clearing comment_votes...
Clearing comments...
...

✅ Cleanup complete!

📊 Final data counts:
   supporters: 1
   verified_voters: 0
   poll_votes: 0
   comments: 0
   ...

🎉 Database is now clean and ready for fresh data!
```

## Option 3: Manual Cleanup via Supabase Dashboard

You can also manually delete records via the Supabase Table Editor:

1. Go to: Supabase Dashboard → Table Editor
2. For each table, click the table name and use the UI to delete records
3. **BE CAREFUL** not to delete your superuser from the `supporters` table

## After Cleanup

### Verify Your Account Still Works

1. Go to https://www.dougcharles.com/admin/login
2. Log in with your superuser credentials
3. Verify you can access the admin dashboard

### What You'll See

- Polls page: Polls still exist but show 0 votes
- Ideas page: Ideas still exist but show 0 votes
- Admin dashboard:
  - Supporters: Just you
  - Verified Voters: Empty (or just you if your email is verified)
  - Comments: Empty
  - Error Logs: Empty

### Ready for Production Launch

Your database is now clean and ready for real users:
- ✅ Test data removed
- ✅ Error logs cleared
- ✅ Admin access preserved
- ✅ Poll/idea structure intact

## Rollback

If you accidentally delete data, you can restore from Supabase backups:

1. Go to: Supabase Dashboard → Database → Backups
2. Select the most recent backup before deletion
3. Restore the backup

**Note**: Supabase keeps automatic daily backups for Pro tier.

## Security Note

⚠️ **Never commit your SUPABASE_SERVICE_KEY to git**

The service key bypasses Row Level Security (RLS) and grants full database access. Always load it from environment variables.

## Troubleshooting

### "Could not find superuser"

Your account may not be marked as superuser. Fix with:

```sql
UPDATE supporters
SET is_superuser = true
WHERE email = 'your@email.com';
```

### Foreign Key Constraint Errors

If you get FK constraint errors, you may need to delete in this order:
1. comment_votes
2. comments
3. idea_votes, idea_support
4. poll_votes
5. verified_voters
6. supporters

The SQL script handles this correctly.

### Permission Denied

Make sure you're using the `service_role` key, not the `anon` key.

## Questions?

See the main documentation or check the admin dashboard at https://www.dougcharles.com/admin
