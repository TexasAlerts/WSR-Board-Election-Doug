# Launch Polls Setup Guide

## Overview
This guide will help you deploy 5 campaign polls to the live website:

1. **Poll 1.1**: Top Issues (multiple choice - select top 5)
2. **Poll 1.2**: Single Most Important Issue (single choice with "Other")
3. **Poll 2.1**: Growth Pace (single choice)
4. **Poll 2.4**: Small-Town Character Importance (single choice)
5. **Poll 3.1**: Property Tax Concern (single choice)

---

## Option 1: Run SQL Migration (Recommended - Fastest)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/ysoypphpoacvcluqvscx/sql
2. Click "New Query"

### Step 2: Copy Migration SQL
1. Open `supabase/migrations/006_launch_polls.sql`
2. Copy the entire contents (140 lines)
3. Paste into the Supabase SQL editor

### Step 3: Execute
1. Click "Run" button
2. Wait for confirmation (should take ~2 seconds)
3. You should see "Success. No rows returned"

### Step 4: Verify
Visit https://www.dougcharles.com/polls - you should see all 5 polls!

---

## Option 2: Use Node.js Script (If SQL Editor Fails)

### Step 1: Install Dependencies
```bash
cd "/Users/dougcharles/Library/Mobile Documents/com~apple~CloudDocs/WSR Board/windsong-campaign-final-ready/WSR-Board-Election-Doug"
npm install
```

### Step 2: Run Migration Script
```bash
node scripts/run-sql-migration.js supabase/migrations/006_launch_polls.sql
```

If this fails (likely - Supabase doesn't expose raw SQL via API), use Option 1 instead.

---

## Option 3: Create via Admin Dashboard

### Step 1: Login to Admin
Visit https://www.dougcharles.com/admin/polls

### Step 2: Create Each Poll Manually

#### Poll 1: Top Issues
- **Title**: Which issues are MOST important to you when it comes to Prosper's Town Government?
- **Description**: Select your top 5 priorities (you can select up to 5 options)
- **Type**: Multiple Choice
- **Visibility**: Public
- **Status**: Active
- **Choices** (12 options):
  1. Traffic congestion and road conditions
  2. Property tax burden
  3. Controlling apartment/multifamily development
  4. Preserving Prosper's small-town character
  5. Public safety (police/fire services)
  6. Water/utility costs
  7. Parks and recreation facilities
  8. Library services
  9. Retail and restaurant options
  10. Downtown/Old Town development
  11. School overcrowding impacts
  12. Flooding/drainage issues

#### Poll 2: Single Most Important Issue
- **Title**: If you could address only ONE issue facing Prosper, what would it be?
- **Type**: Single Choice
- **Visibility**: Public
- **Status**: Active
- **Choices** (11 options):
  1. Fix traffic congestion and improve roads
  2. Lower property taxes
  3. Stop excessive apartment development
  4. Maintain our small-town feel
  5. Improve public safety response times
  6. Control water/utility rate increases
  7. Build better parks and recreation facilities
  8. Expand library services
  9. Attract more restaurants and shopping
  10. Revitalize Downtown Prosper
  11. Other *(mark as "Other" option)*

#### Poll 3: Growth Pace
- **Title**: Do you think Prosper is growing...
- **Type**: Single Choice
- **Visibility**: Public
- **Status**: Active
- **Choices** (4 options):
  1. Too fast - we need to slow down development
  2. At about the right pace
  3. Too slow - we should encourage more growth
  4. Unsure / No opinion

#### Poll 4: Small-Town Character
- **Title**: How important is it to you that Prosper maintains its "small-town character"?
- **Type**: Single Choice
- **Visibility**: Public
- **Status**: Active
- **Choices** (5 options):
  1. Extremely important - it's why I moved here
  2. Very important
  3. Somewhat important
  4. Not very important
  5. Not important at all - growth is inevitable

#### Poll 5: Property Tax Concern
- **Title**: Prosper's median property tax bill is over $12,000 annually. How concerned are you about property taxes?
- **Type**: Single Choice
- **Visibility**: Public
- **Status**: Active
- **Choices** (5 options):
  1. Extremely concerned - it's affecting my ability to stay in Prosper
  2. Very concerned
  3. Somewhat concerned
  4. Not very concerned
  5. Not concerned at all

---

## What Happens After Deployment

### Immediate Effects
- All 5 polls appear on https://www.dougcharles.com/polls
- Public users must verify their email before voting (one-time verification)
- Registered supporters can vote immediately (already authenticated)
- One vote per person per poll (enforced by email)

### User Experience
1. User visits `/polls` page
2. Sees all 5 active polls with vote counts
3. Clicks "Vote Now" → Email verification modal appears (if not verified)
4. Verifies email → Voting modal opens with poll choices
5. Selects choices → Submits vote
6. Can view results at `/polls/{poll-id}` after voting
7. Can add optional comment (requires supporter account)

### Admin Capabilities
- View all polls at `/admin/polls`
- See vote counts and statistics
- Create/edit/close polls
- View detailed results at `/admin/reports/polls`
- Moderate comments

---

## Migration Details

The `006_launch_polls.sql` migration does the following:

1. **Schema Updates** (if not already present):
   - Adds `is_other_option` column to `poll_choices` table
   - Adds `other_text` column to `poll_votes` table
   - Adds `display_name` column to `comments` table
   - Updates `poll_type` constraint to support `ranked_choice`

2. **Data Inserts**:
   - Creates 5 polls with predefined UUIDs
   - Inserts 37 total poll choices across all polls
   - Sets all polls to `active` status with `public` visibility

---

## Rollback (If Needed)

If you need to remove the polls:

```sql
-- Delete the 5 launch polls and their choices
DELETE FROM poll_choices WHERE poll_id IN (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000005'
);

DELETE FROM polls WHERE id IN (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000005'
);
```

---

## Verification Checklist

After deployment, verify:

- [ ] Visit https://www.dougcharles.com/polls
- [ ] All 5 polls are visible
- [ ] Each poll shows 0 votes initially
- [ ] "Vote Now" button works
- [ ] Email verification modal appears for unauthenticated users
- [ ] Can complete a test vote successfully
- [ ] Poll 1.2 "Other" option shows text input when selected
- [ ] Admin dashboard shows all polls at `/admin/polls`
- [ ] No console errors in browser

---

## Troubleshooting

### Polls don't appear
- Check poll `status` is 'active' in database
- Check poll `visibility` is 'public'
- Check `published_at` is set to NOW()

### Can't vote
- Verify email verification system is working
- Check Telnyx/Resend API keys in production `.env`
- Check browser console for errors

### "Other" option not working (Poll 1.2)
- Verify `is_other_option` column exists in `poll_choices` table
- Check migration ran successfully

### Database errors
- Ensure service role key has proper permissions
- Check Supabase RLS policies allow public access to polls

---

## Next Steps

After polls are live:
1. Test voting flow with cache-busting (?nocache=timestamp)
2. Share poll links on social media
3. Monitor vote counts in admin dashboard
4. Review comments and moderate as needed
5. Consider adding more polls from `prosper_campaign_polls_2.md`

