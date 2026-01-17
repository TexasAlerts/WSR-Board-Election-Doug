# Community Engagement Features Plan

## Current State vs. Required Features

### What's Currently Implemented
- Basic polls page (view/vote with email)
- Basic ideas page (submit/support with email)
- Simple localStorage-based "already voted" tracking
- No authentication system
- No comment moderation
- No email notifications beyond form submissions
- No admin panel for polls/ideas

### Design Decisions (Confirmed)
1. **Authentication**: Email verification → password creation (NO magic links)
2. **Account Approval**: Auto-approve when email verified + valid address + valid phone (SMS verified)
3. **Public Poll Voting**: Requires verified email only (one vote per verified email)
4. **Weekly Updates**: Sent on Fridays
5. **Broadcast Editor**: HTML editor for rich formatting
6. **Notifications**: Email AND SMS (Telnyx) - consent-based delivery
7. **Ideas Visibility**: Require admin approval before public display
8. **Comments**: Supporters only (public can read but not post), thumbs up/down voting
9. **Replies**: Unlimited depth threading
10. **Ideas**: Up/down voting (not just support)
11. **Address Validation**: USPS API for supporter registration
12. **Phone Validation**: SMS verification code via Telnyx for supporters

### What's Needed (Based on WSR Board Member)

---

## Phase 1: Authentication System

### 1.1 User Registration
- **Registration form** collecting:
  - First name, last name (required)
  - Email (required, unique)
  - Phone (required, validated)
  - Address: street, city, state, zip (required for Prosper verification)
  - **Email consent checkbox** for campaign updates/blasts
  - **SMS consent checkbox** for text alerts (future use)
  - Consent timestamp captured when checked

### 1.2 Phone Validation & SMS Verification
- Validate US phone numbers using libphonenumber-js (format check)
- Accept formats: (xxx) xxx-xxxx, xxx-xxx-xxxx, +1xxxxxxxxxx
- Store in E.164 format (+1XXXXXXXXXX)
- **SMS verification via Telnyx**: Send 6-digit code, 10-minute expiry
- Cost: ~$0.004 per SMS (half of Twilio)

### 1.3 Address Validation (USPS)
- Use USPS Web Tools API (free, requires registration)
- Verify address exists and is deliverable
- Standardize address format (proper casing, abbreviations)
- Store both original and standardized address

### 1.4 Account Status Workflow
- `pending_email` - Registration submitted, awaiting email verification
- `pending_phone` - Email verified, awaiting SMS verification
- `approved` - **Auto-approved** once email verified + phone verified + valid address
- `suspended` - Account disabled by admin

**Note**: No manual approval step. System auto-approves valid registrations.

### 1.5 Supporter Registration Flow
1. **Registration**: User submits form with email, phone, address
2. **Address Validation**: USPS API validates address (instant)
3. **Email Verification**: System sends verification email with token link
4. **Password Creation**: After clicking email link, user creates password
5. **SMS Verification**: System sends 6-digit code to phone
6. **Auto-Approval**: Account becomes `approved` after phone verified
7. **Login**: Email + password (standard authentication)

### 1.6 Database Tables Needed
```sql
-- Supporters table (replaces simple email collection)
CREATE TABLE supporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- NULL until password created after verification
  phone TEXT NOT NULL, -- Stored in E.164 format
  phone_verified BOOLEAN DEFAULT false,
  street_address TEXT NOT NULL,
  street_address_standardized TEXT, -- USPS standardized version
  city TEXT DEFAULT 'Prosper',
  state TEXT DEFAULT 'TX',
  zip_code TEXT NOT NULL,
  address_validated BOOLEAN DEFAULT false,
  email_consent BOOLEAN DEFAULT true, -- Default: opted in
  sms_consent BOOLEAN DEFAULT true, -- Default: opted in
  consent_timestamp TIMESTAMPTZ,
  status TEXT DEFAULT 'pending_email' CHECK (status IN ('pending_email', 'pending_phone', 'approved', 'suspended')),
  role TEXT DEFAULT 'supporter' CHECK (role IN ('supporter', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ -- Set when phone verified (auto-approval)
);

-- SMS verification codes
CREATE TABLE sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  code TEXT NOT NULL, -- 6-digit code
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email verification tokens (also used for password creation flow)
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  purpose TEXT DEFAULT 'verify' CHECK (purpose IN ('verify', 'password_reset')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (standard session-based auth, no magic links)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 2: Poll Visibility & Access Control

### 2.1 Poll Visibility Options
Add `visibility` field to polls:
- `public` - Anyone can view, **verified email required to vote** (one vote per verified user)
- `public_view` - Anyone can view, only authenticated supporters can vote
- `authenticated` - Only logged-in supporters can view and vote

### 2.2 Updated Polls Table
```sql
ALTER TABLE polls ADD COLUMN visibility TEXT DEFAULT 'authenticated'
  CHECK (visibility IN ('public', 'public_view', 'authenticated'));
ALTER TABLE polls ADD COLUMN notify_voters_weekly BOOLEAN DEFAULT true;
ALTER TABLE polls ADD COLUMN created_by UUID REFERENCES supporters(id);
```

### 2.3 Voting Logic
- **Public polls**: Require verified email to vote (creates lightweight "verified voter" record if not a full supporter)
- **Authenticated polls**: Require full supporter login, track by supporter_id
- Update `poll_votes` table:
```sql
ALTER TABLE poll_votes ADD COLUMN supporter_id UUID REFERENCES supporters(id);
-- voter_email used for public poll verified-email votes
```

### 2.4 Public Poll Verified Voter Table
```sql
-- Lightweight table for public poll email verification
CREATE TABLE verified_voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL,
  verification_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**Flow**: Enter email → receive verification link → click to verify → can vote on public polls (one vote per email)

---

## Phase 3: Comment Moderation System

### 3.1 Comment Workflow
- User submits comment → status = `pending`
- Admin/Super Admin comments → auto-approved
- Admin reviews in moderation queue
- On approval: notify comment author, notify thread participants
- On rejection: notify comment author with reason

### 3.2 Updated Comments Table
```sql
ALTER TABLE comments ADD COLUMN supporter_id UUID REFERENCES supporters(id);
ALTER TABLE comments ADD COLUMN moderated_by UUID REFERENCES supporters(id);
ALTER TABLE comments ADD COLUMN moderated_at TIMESTAMPTZ;
ALTER TABLE comments ADD COLUMN rejection_reason TEXT;
ALTER TABLE comments ADD COLUMN parent_id UUID REFERENCES comments(id) ON DELETE CASCADE; -- for unlimited threading
ALTER TABLE comments ADD COLUMN upvotes INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN downvotes INTEGER DEFAULT 0;
```

### 3.3 Comment Voting (Thumbs Up/Down)
```sql
CREATE TABLE comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, supporter_id) -- one vote per person per comment
);
```

### 3.4 Unlimited Threaded Replies
Comments now use self-referencing `parent_id` for unlimited depth:
- `parent_id = NULL` → top-level comment
- `parent_id = <comment_id>` → reply to that comment
- Replies can have replies indefinitely

### 3.5 Thread Subscriptions
```sql
CREATE TABLE thread_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((poll_id IS NOT NULL AND idea_id IS NULL) OR (poll_id IS NULL AND idea_id IS NOT NULL))
);
```

---

## Phase 4: Email System

### 4.1 Transactional Emails
Using Resend API (already configured):

| Email Type | Trigger | Recipient |
|------------|---------|-----------|
| Verification | Registration | New supporter |
| Verification Reminder | 12 hours after registration | Unverified supporter |
| Password Reset | Reset request | Supporter |
| Welcome Email | After password created (auto-approved) | New supporter |
| Comment Approved | Moderation | Comment author |
| Comment Rejected | Moderation | Comment author |
| Reply Notification | Someone replies | Comment author |
| Thread Activity | New approved comment | Thread participants |
| Admin: New Registration | Verification complete | Admin |
| Admin: Comment Pending | Comment submitted | Admin |

### 4.2 Broadcast/Blast System (Email & SMS)
```sql
CREATE TABLE broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_type TEXT NOT NULL CHECK (broadcast_type IN ('email', 'sms', 'both')),
  subject TEXT, -- NULL for SMS-only
  body TEXT NOT NULL, -- HTML for email, plain text for SMS (160 char limit)
  sent_by UUID REFERENCES supporters(id),
  email_recipient_count INTEGER DEFAULT 0,
  sms_recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Consent-Based Delivery**:
| Broadcast Type | Recipients |
|----------------|------------|
| Email only | All with `email_consent = true` |
| SMS only | All with `sms_consent = true` |
| Both | Email to email-consented, SMS to sms-consented |

**Email Blasts**:
- Uses Resend batch API (100 emails per request)
- HTML WYSIWYG editor
- Includes unsubscribe link

**SMS Blasts**:
- Uses Telnyx API
- 160 character limit (standard SMS)
- Cost: ~$0.004 per SMS
- Includes STOP instructions for opt-out

### 4.3 Weekly Poll Updates
- For authenticated polls only
- Sent every **Friday** to voters on that poll
- Summary: current vote counts, new comments since last week
- Unsubscribe option per poll

### 4.4 Email Service Implementation
```javascript
// src/lib/emailService.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email, name, token) { ... }
export async function sendPasswordResetEmail(email, name, token) { ... }
export async function sendWelcomeEmail(email, name) { ... }
export async function sendCommentApproved(email, name, commentPreview, contextTitle) { ... }
export async function sendThreadActivity(emails, newComment, threadTitle) { ... }
export async function sendBroadcast(subject, body, emails) { ... }
export async function sendWeeklyPollUpdate(pollId) { ... }
```

---

## Phase 5: Admin Panel

### 5.1 Admin Dashboard (`/admin`)
- Pending approvals count
- Pending comments count
- Active polls count
- Total supporters count
- Quick action buttons

### 5.2 Supporter Management (`/admin/supporters`)
- List all supporters with search/filter
- View registration status (pending_email, approved, suspended)
- Suspend/unsuspend accounts
- View supporter details and activity
- Export supporter list (consenting only)

**Note**: No approval queue needed - supporters auto-approve on verification.

### 5.3 Poll Management (`/admin/polls`)
- Create/edit polls
- Set visibility (public/public_view/authenticated)
- Configure: allow_comments, show_results_before_vote, notify_voters_weekly
- Publish/close polls
- View results and voter list
- Export poll data

### 5.4 Idea Management (`/admin/ideas`)
- View all submitted ideas
- **Moderation queue** - Ideas require approval before public display
- Approve/reject with response
- Track up/down vote counts

### 5.4.1 Idea Voting Schema
```sql
-- Update ideas table
ALTER TABLE ideas ADD COLUMN upvotes INTEGER DEFAULT 0;
ALTER TABLE ideas ADD COLUMN downvotes INTEGER DEFAULT 0;
-- Remove old support_count if exists, or keep for backwards compatibility

-- Idea votes table (replaces idea_supports for up/down)
CREATE TABLE idea_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, supporter_id) -- one vote per person per idea
);
```

### 5.5 Comment Moderation (`/admin/comments`)
- Pending comments queue
- Approve/reject with optional reason
- View context (poll/idea title)
- Magic link for one-click review from email

### 5.6 Broadcast Management (`/admin/broadcasts`)
- Create broadcast with **HTML WYSIWYG editor** (rich text formatting)
- Preview before sending
- Send to consenting supporters
- View send history

### 5.7 Audit Logs (`/admin/audit`)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id),
  event_type TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Event types: LOGIN, LOGOUT, VOTE_CAST, COMMENT_SUBMITTED, COMMENT_APPROVED, COMMENT_REJECTED, SUPPORTER_APPROVED, SUPPORTER_REJECTED, BROADCAST_SENT, etc.

---

## Phase 6: Public vs. Authenticated Views

### 6.1 Public Pages (No Login Required)
| Page | View | Interact |
|------|------|----------|
| Home | Yes | - |
| Polls List | Yes (public & public_view) | Vote on public polls only |
| Poll Detail | Yes (public & public_view) | Vote on public, comment if poll allows |
| Ideas List | Yes | No |
| Idea Detail | Yes | No |
| Endorsements | Yes | Submit (email only) |
| Get Involved | Yes | Submit forms |

### 6.2 Authenticated Pages (Login Required)
| Page | Features |
|------|----------|
| Polls List | View all polls, vote on all |
| Poll Detail | Vote, comment, see full results |
| Ideas List | Submit ideas, support ideas |
| Idea Detail | Comment, support |
| My Profile | Edit info, consent settings |
| My Votes | History of poll participation |

### 6.3 Admin Pages (Admin Role Required)
- `/admin/*` routes
- All management features above

---

## Implementation Priority

### Week 1: Foundation
1. Create `supporters` table and auth tables
2. Implement registration flow with email verification
3. Implement password creation after verification
4. Create session management with email/password login
5. Add protected route middleware

### Week 2: Polls & Comments
1. Update polls with visibility field
2. Implement authenticated voting
3. Create comment moderation system
4. Build admin comment queue

### Week 3: Email Notifications
1. Set up Resend integration
2. Implement transactional emails
3. Add thread activity notifications
4. Create weekly poll update job

### Week 4: Admin Panel
1. Build admin dashboard
2. Supporter management
3. Poll management
4. Broadcast system

### Week 5: Polish & Testing
1. Ideas full implementation
2. Audit logging
3. Error handling
4. Mobile optimization
5. Testing

---

## Environment Variables Needed

```env
# Existing
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# New
RESEND_API_KEY=
TELNYX_API_KEY=
TELNYX_PHONE_NUMBER=
USPS_USER_ID=
ADMIN_EMAIL=doug@dougcharles.com
SESSION_SECRET=
SESSION_EXPIRY_HOURS=48
VERIFICATION_EXPIRY_HOURS=24
PASSWORD_RESET_EXPIRY_HOURS=1
SMS_CODE_EXPIRY_MINUTES=10
```

---

## Design Decisions (Resolved)

| Question | Decision |
|----------|----------|
| Public poll voting | Verified email only (one vote per verified email) |
| Supporter registration | Email verify + SMS verify + USPS address validation |
| Account approval | Auto-approve after all verifications pass |
| Weekly updates | Sent on Fridays |
| Blast system | Email (HTML editor) + SMS (Telnyx), consent-based |
| Comments | Supporters only, thumbs up/down voting, unlimited reply depth |
| Ideas | Up/down voting, require admin approval before public display |

---

## Dependencies to Install

```bash
npm install libphonenumber-js bcryptjs resend react-quill telnyx
```

- **libphonenumber-js** - Phone number format validation (open source, Google's library)
- **bcryptjs** - Password hashing
- **resend** - Transactional email service
- **react-quill** - HTML WYSIWYG editor for broadcasts
- **telnyx** - SMS verification and blast messages (~$0.004/SMS, half of Twilio)

---

## Future Enhancement: Self-Hosted SMS

Current implementation uses Telnyx (~$0.004/SMS). Future options for self-hosted:
- **USB GSM modem + Gammu/PlaySMS** - One-time hardware cost, then free
- **Signal CLI** - Free but requires Signal accounts on both ends

---

## Approval Checklist

Please confirm each section to proceed with implementation:

- [ ] Phase 1: Authentication System (email verify → password creation, auto-approval)
- [ ] Phase 2: Poll Visibility & Access Control (public polls need verified email)
- [ ] Phase 3: Comment Moderation System
- [ ] Phase 4: Email System (weekly on Fridays)
- [ ] Phase 5: Admin Panel (HTML editor for broadcasts)
- [ ] Phase 6: Public vs. Authenticated Views (ideas require approval)
- [ ] Implementation Priority Order

Once approved, I'll begin implementation starting with the database migrations and authentication system.
