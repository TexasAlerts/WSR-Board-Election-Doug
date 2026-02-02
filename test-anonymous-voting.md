# Anonymous Voting Test Plan

## Quick Visual Test (2 minutes)

### Test 1: Anonymous Voting Flow
1. Open http://localhost:3000/polls (or production URL)
2. Click "Vote Now" on any poll
3. **Expected**: VotingOptionsModal appears with three options:
   - ✅ "Register for Full Access" (navy icon)
   - ✅ "Verify Email to Get Notified" (navy icon)
   - ✅ "Vote Anonymously" (gray icon)
4. Click "Vote Anonymously"
5. **Expected**: Vote modal opens with:
   - Gray banner: "Voting anonymously"
   - NO email/name fields
   - Poll choices visible
   - NO comment field
6. Select a choice and click "Submit Vote"
7. **Expected**: "Thank you for voting!" message
8. Check browser DevTools → Application → Cookies
9. **Expected**: Cookie named "av_session" with 32-char hex value

### Test 2: Duplicate Vote Prevention
1. After voting anonymously, try to vote again on the same poll
2. Click "Vote Now"
3. **Expected**: Error message "You have already voted on this poll"

### Test 3: Registered User Flow (for comparison)
1. Register or log in at /auth/login
2. Go to /polls and click "Vote Now"
3. **Expected**: Vote modal opens IMMEDIATELY (no options modal)
4. **Expected**: Green banner "Voting as: [Your Name] ✓ Authenticated"
5. **Expected**: Comment field IS visible

## Backend API Test (30 seconds)

Test anonymous vote via API:

```bash
curl -X POST http://localhost:3000/api/polls/[POLL_ID]/vote \
  -H "Content-Type: application/json" \
  -H "User-Agent: TestBrowser/1.0" \
  -d '{
    "choice_id": "[CHOICE_ID]"
  }'
```

**Expected Response**:
```json
{"ok": true}
```

**Expected Cookie in Response**:
```
Set-Cookie: av_session=[32-char-hex]; HttpOnly; Path=/; Max-Age=31536000; SameSite=lax
```

## Database Verification

```bash
node verify-and-migrate.mjs
```

**Expected Output**:
```
✅ anonymous_voter_token column: EXISTS
✅ anonymous_voter_fingerprint column: EXISTS
✅ Database is ready for anonymous voting!
✅ Columns exist! (Foreign key error is expected)
```

## Build Test

```bash
npm run build
```

**Expected**: Build completes successfully with no errors

---

## Test Results

Date: _____________
Tester: _____________

- [ ] Test 1: Anonymous voting flow works
- [ ] Test 2: Duplicate vote prevention works
- [ ] Test 3: Registered user flow unchanged
- [ ] Backend API test passes
- [ ] Database verification passes
- [ ] Build test passes

**Notes**: _______________________________________________________

