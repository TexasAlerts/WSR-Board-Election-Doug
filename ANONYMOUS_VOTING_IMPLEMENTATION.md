# Anonymous Voting Implementation

**Date**: February 2, 2026
**Status**: Backend Complete - Frontend Integration Needed

---

## Overview

Implemented a flexible voting system that allows anonymous visitors to vote on public polls without registration, while still preventing duplicate votes through moderate security measures.

## Voting Flow

### 1. **Fully Registered Supporters** (Highest Trust)
- Can vote, comment, and reply
- Tracked by `supporter_id`
- Receive email notifications on poll updates

### 2. **Verified Voters** (Email Verified)
- Provided email and verified via Telnyx SMS/email
- Can vote and receive poll update notifications
- Tracked by `voter_email`
- Cannot comment/reply

### 3. **Anonymous Voters** (NEW - Lowest Barrier)
- No email or registration required
- Can only vote (no comments/replies)
- Tracked by browser cookie + IP fingerprint
- No notifications

---

## Duplicate Vote Prevention

### Moderate Security Approach (Implemented)

**Two-Factor Tracking:**
1. **Browser Cookie**: Random 32-character token stored in httpOnly cookie (1 year expiration)
2. **Browser Fingerprint**: SHA-256 hash of `IP address + User-Agent`

**How It Works:**
- A vote is considered duplicate if **either** the cookie token **or** fingerprint matches an existing vote for that poll
- This prevents:
  - Same person voting multiple times from same device ✅
  - Same person on same network using different devices ✅ (via fingerprint)
  - Casual vote manipulation ✅

**Limitations** (acceptable trade-offs):
- Can be bypassed by clearing cookies + using VPN/different network
- Shared IP addresses (families, offices) are handled gracefully - each device gets one vote
- Incognito mode + VPN = new vote (intentional - prioritizes accessibility)

---

## Files Changed

### 1. **src/lib/anonymousVoting.js** (NEW)
Helper functions for anonymous voting:
- `generateAnonymousVoterFingerprint(ip, userAgent)` - Creates SHA-256 hash
- `generateAnonymousVoterToken()` - Generates random 32-char hex token
- Cookie constants and options

### 2. **src/app/api/polls/[id]/vote/route.js** (MODIFIED)
Updated voting API to support three voting modes:
- Added anonymous voting logic
- Modified schema to make `email` and `name` optional
- Added duplicate checking for anonymous voters (cookie OR fingerprint)
- Sets httpOnly cookie after anonymous vote
- Updated audit logging to track voting mode

**Key Changes:**
- Lines 9-13: Import anonymous voting utilities
- Lines 32-49: Modified schema - email/name optional
- Lines 85-136: New voter identity logic with anonymous support
- Lines 137-162: Updated duplicate check for all three voter types
- Lines 188-225: Vote insertion with anonymous fields + cookie setting

### 3. **ANONYMOUS_VOTING_MIGRATION.sql** (NEW)
Database schema changes required:
- Add `anonymous_voter_token` column (VARCHAR(32))
- Add `anonymous_voter_fingerprint` column (VARCHAR(64))
- Make `voter_email` nullable
- Add check constraint to ensure at least one identifier exists
- Create indexes for performance

---

## Database Migration Required

**CRITICAL**: Before deploying, run the SQL migration in Supabase:

```sql
-- See ANONYMOUS_VOTING_MIGRATION.sql for full migration
ALTER TABLE poll_votes
ADD COLUMN IF NOT EXISTS anonymous_voter_token VARCHAR(32),
ADD COLUMN IF NOT EXISTS anonymous_voter_fingerprint VARCHAR(64);

ALTER TABLE poll_votes ALTER COLUMN voter_email DROP NOT NULL;

-- ... (see full file for indexes and constraints)
```

---

## Frontend Integration Needed

The backend is complete, but the frontend needs updates to support the new flow:

### Required Frontend Changes:

1. **Update Voting Modal/Component** (e.g., `src/components/PollsDynamic.jsx`)
   - Show "Register/Verify for updates" prompt **before** vote submission
   - Explain benefits: "Get notified when results are in!"
   - Add "Skip and vote anonymously" button
   - If user skips: Submit vote without `email`/`name` fields
   - If user clicks verify: Show existing verification flow

2. **Handle Anonymous Vote Response**
   - The API now sets a cookie automatically
   - No frontend cookie handling needed
   - Consider showing success message: "Vote recorded! Register to get poll updates."

3. **Update Poll Display**
   - Show appropriate UI based on user state:
     - Not logged in + no cookie → Show "Vote" button → Prompt → Anonymous vote
     - Has anonymous cookie for this poll → Show "You voted" (can't see which choice)
     - Verified voter → Show vote + notification preferences
     - Full supporter → Show vote + comment + reply

### Example Frontend Flow:

```javascript
// When user clicks "Vote" button
if (!isAuthenticated && !hasVerifiedEmail) {
  showPrompt({
    title: "Get Poll Updates?",
    message: "Register or verify your email to be notified when results are in!",
    options: [
      { label: "Register", action: () => redirectToRegistration() },
      { label: "Verify Email", action: () => showEmailVerification() },
      { label: "Vote Anonymously", action: () => submitAnonymousVote() },
    ]
  });
}

async function submitAnonymousVote() {
  // Submit WITHOUT email/name fields
  const response = await fetch(`/api/polls/${pollId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      choice_id: selectedChoiceId,
      // NO email, NO name
    }),
  });

  if (response.ok) {
    // Cookie is set automatically by API
    showSuccess("Vote recorded! Register to get updates on this poll.");
  }
}
```

---

## Security Considerations

### What This Prevents:
✅ Casual duplicate voting (clearing browser = effort)
✅ Multiple devices on same network each voting once
✅ Simple automation/bots (need to handle cookies + vary User-Agent)

### What This Does NOT Prevent:
❌ Determined attackers with VPN rotation
❌ Sophisticated bots
❌ Distributed vote manipulation

### Why This Is Acceptable:
- **Goal**: Maximize participation, not Fort Knox security
- **Context**: Community polling for candidate engagement, not binding elections
- **Risk**: Vote manipulation impact is low - polls are advisory
- **Benefit**: Removes barrier to participation for privacy-conscious voters

---

## Testing Checklist

### Manual Testing Required:

- [ ] **Anonymous Vote Flow**
  - [ ] Visit poll page (not logged in)
  - [ ] Click vote without email/name
  - [ ] Verify vote recorded
  - [ ] Check cookie is set (DevTools → Application → Cookies)
  - [ ] Try voting again → Should see "already voted" error
  - [ ] Clear cookie → Should be able to vote again
  - [ ] Use different browser (same network) → Should be blocked by fingerprint

- [ ] **Verified Voter Flow**
  - [ ] Provide email, verify
  - [ ] Vote on poll
  - [ ] Check vote uses `voter_email` tracking
  - [ ] Try voting again → Should see error

- [ ] **Registered Supporter Flow**
  - [ ] Log in as supporter
  - [ ] Vote with comment
  - [ ] Check comment appears (pending approval)
  - [ ] Try voting again → Should see error

- [ ] **Database Verification**
  - [ ] Check anonymous votes have `anonymous_voter_token` and `anonymous_voter_fingerprint` populated
  - [ ] Check `voter_email` is NULL for anonymous votes
  - [ ] Check verified votes have `voter_email` populated
  - [ ] Check supporter votes have `supporter_id` populated

---

## Next Steps

1. **Run database migration** in Supabase SQL editor
2. **Update frontend voting components** with verification prompt
3. **Test all three voting paths** thoroughly
4. **Monitor analytics** to see adoption of each voting method
5. **Consider adding** optional post-vote email capture ("Want results emailed?")

---

## Configuration

No environment variables needed - uses existing:
- `NODE_ENV` - For cookie secure flag
- Existing rate limiting and IP tracking

---

## Rollback Plan

If issues arise:

1. **Database Rollback:**
   ```sql
   ALTER TABLE poll_votes DROP COLUMN anonymous_voter_token;
   ALTER TABLE poll_votes DROP COLUMN anonymous_voter_fingerprint;
   ALTER TABLE poll_votes ALTER COLUMN voter_email SET NOT NULL;
   ```

2. **Code Rollback:**
   - Revert changes to `src/app/api/polls/[id]/vote/route.js`
   - Remove `src/lib/anonymousVoting.js`
   - Existing verified voter flow will continue working

---

## Questions?

Contact development team or review:
- Implementation: `src/app/api/polls/[id]/vote/route.js`
- Utilities: `src/lib/anonymousVoting.js`
- Migration: `ANONYMOUS_VOTING_MIGRATION.sql`
