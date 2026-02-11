# Email & SMS Communications Review
## Doug Charles Campaign - www.dougcharles.com
**Date:** 2026-02-10

---

## 📧 EMAIL #1: Email Verification (New Registration)

### Trigger Logic
**File:** `src/app/api/auth/register/route.js` (line 191)
```javascript
// After successful address validation and supporter creation
const verification = await emailService.sendVerificationEmail(email, first_name, token);
```

**Conditions:**
- User submits registration form with valid data
- USPS address validation passes
- Email doesn't already exist in database
- Supporter record created successfully

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {email}
**Subject:** Verify your email - Doug Charles for Prosper

**Body:**
```
Welcome, {firstName}!

Thank you for signing up as a supporter. Please verify your email address to continue.

[BUTTON: Verify Email & Create Password]
Link: https://www.dougcharles.com/auth/verify?token={token}

This link expires in 24 hours. If you didn't sign up, you can ignore this email.

---
Doug Charles for Prosper Town Council
www.dougcharles.com

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Token expiry:** 24 hours
- **Database record:** email_verifications table
- **Next step:** User clicks link → verify page → create password

---

## 📧 EMAIL #2: Password Reset

### Trigger Logic
**File:** `src/app/api/auth/forgot-password/route.js` (line 48)
```javascript
// If email exists AND is verified
if (supporter && supporter.email_verified) {
  await emailService.sendPasswordResetEmail(email, supporter.first_name, resetToken);
}
// Always returns success to prevent email enumeration
```

**Conditions:**
- User submits "forgot password" form
- Email exists in database
- Email is verified (email_verified = true)
- Returns success even if email doesn't exist (security measure)

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {email}
**Subject:** Reset your password - Doug Charles for Prosper

**Body:**
```
Password Reset Request

Hi {firstName}, we received a request to reset your password.

[BUTTON: Reset Password]
Link: https://www.dougcharles.com/auth/reset-password?token={token}

This link expires in 1 hour. If you didn't request this, you can ignore this email.

---
Doug Charles for Prosper Town Council
www.dougcharles.com

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Token expiry:** 1 hour (NOT 24 hours like verification)
- **Security:** Always returns success to prevent email enumeration
- **Rate limit:** 3 requests per IP per hour

---

## 📱 SMS #1: Phone Verification Code

### Trigger Logic
**File:** `src/app/api/auth/verify/route.js` (line 119)
```javascript
// After email verification and password creation
if (phone) {
  const smsResult = await sendVerificationSMS(phone);
}
```

**Also triggered by:** Manual resend via `/api/auth/send-sms-code/route.js`

**Conditions:**
- User completed email verification
- User created password
- User provided phone number during registration
- Phone number is valid US number

### SMS Content
**From:** {TELNYX_PHONE_NUMBER}
**To:** {phone}

**Message:**
```
Your Doug Charles for Prosper verification code is: {6-digit-code}

This code expires in 10 minutes.
```

### Technical Details
- **Code expiry:** 10 minutes
- **Attempts limit:** 5 attempts per user
- **Rate limit:** 3 SMS per IP per 10 minutes
- **Database:** sms_verifications table
- **Provider:** Telnyx A2P 10DLC

---

## 📧 EMAIL #3: Welcome Email (After Full Verification)

### Trigger Logic
**File:** `src/app/api/auth/verify-sms/route.js` (line 113)
```javascript
// After successful SMS verification
await emailService.sendWelcomeEmail(supporter.email, supporter.first_name);
```

**OR:** `src/app/api/auth/skip-phone/route.js` (line 130)
```javascript
// If user skips phone verification
await emailService.sendWelcomeEmail(supporter.email, supporter.first_name);
```

**Conditions:**
- User successfully verified SMS code, OR
- User clicked "Skip phone verification"
- Supporter status updated to 'approved'

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {email}
**Subject:** Welcome to Doug Charles for Prosper!

**Body:**
```
Welcome, {firstName}!

Your account has been verified and you're now an official supporter!

As a supporter, you can:
• Vote on all polls (public and supporter-only)
• Comment on polls and ideas
• Submit and vote on community ideas
• Receive campaign updates

[BUTTON: View Active Polls]
Link: https://www.dougcharles.com/polls

Thank you for your support!

Doug Charles
Candidate for Prosper Town Council, Place 5

---
Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Trigger:** Final step of registration process
- **Status change:** supporter.status = 'approved'

---

## 📧 EMAIL #4: Phone Update Reminder

### Trigger Logic
**File:** `src/app/api/auth/skip-phone/route.js` (line 133)
```javascript
// Only if user skipped phone verification
await emailService.sendPhoneUpdateReminderEmail(supporter.email, supporter.first_name);
```

**Conditions:**
- User clicked "Skip phone verification" during registration
- Sent immediately after welcome email

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {email}
**Subject:** Update Your Phone Number - Doug Charles for Prosper

**Body:**
```
Update Your Phone Number

Hi {firstName},

Welcome to the campaign! You skipped phone verification during signup. To stay informed on polls, comments, and ideas via text message, we recommend updating your phone to a cell number.

[BUTTON: Update Phone Number]
Link: https://www.dougcharles.com/settings

You can update your phone number and verify it anytime in your account settings.

---
Doug Charles for Prosper Town Council
www.dougcharles.com

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Purpose:** Encourage phone verification for future SMS campaigns
- **User action:** Can verify phone later in settings

---

## 📧 EMAIL #5: Voter Verification (Lightweight)

### Trigger Logic
**File:** `src/app/api/verified-voters/request-verification/route.js` (line 105)
```javascript
// Non-registered user wants to vote on a poll
await emailService.sendVoterVerificationEmail(email, name, token);
```

**Conditions:**
- User tries to vote on a poll without being logged in
- User provides email and name (no password required)
- Email doesn't belong to an existing supporter

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {email}
**Subject:** Verify your email to vote - Doug Charles for Prosper

**Body:**
```
Hi {name}!

Thank you for wanting to participate in our community polls. Please verify your email to cast your vote.

[BUTTON: Verify Email & Vote]
Link: https://www.dougcharles.com/auth/verify-voter?token={token}

This link expires in 24 hours. If you didn't request this, you can ignore this email.

---
Doug Charles for Prosper Town Council
www.dougcharles.com

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Token expiry:** 24 hours
- **Rate limit:** 3 requests per minute per IP
- **Database:** verified_voters table
- **Difference from registration:** No password, limited features

---

## 📧 EMAIL #6: Endorsement Submission Confirmation

### Trigger Logic
**File:** `src/app/api/endorsements/route.js` (line 134-138)
```javascript
// Immediately after endorsement submission
await sendEmail(
  email,
  'Thanks for your endorsement',
  `Hi ${name},\n\nThank you for endorsing Doug.\n${message ? `Your message: ${message}\n\n` : ''}We will notify you once it is published.\n\n--\nDoug Charles`
).catch(() => {});
```

**Conditions:**
- User submits endorsement form (authenticated or public)
- Passes reCAPTCHA validation
- Endorsement saved to database with status='pending'

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Thanks for your endorsement

**Body:**
```
Hi {name},

Thank you for endorsing Doug.
Your message: {message}

We will notify you once it is published.

--
Doug Charles
```

### Technical Details
- **Status:** pending (awaiting admin approval)
- **Error handling:** Fire-and-forget (catches errors silently)
- **Admin notification:** Separate email sent to NOTIFY_EMAIL

---

## 📧 EMAIL #7: Endorsement Approved

### Trigger Logic
**File:** `src/app/api/admin/endorsements/route.js` (line 124-128)
```javascript
// Admin clicks "Approve" button in admin panel
if (data?.email) {
  await sendEmail(
    data.email,
    'Your endorsement has been published',
    `Hi ${data.name || ''},\n\nYour endorsement is now live: ${site}/endorsements\n\nThank you for your support!\n\n--\nDoug Charles`
  ).catch(() => {});
}
```

**Conditions:**
- Admin logs into admin panel
- Admin views endorsements tab
- Admin clicks "Approve" on pending endorsement
- Status changes: pending → approved

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Your endorsement has been published

**Body:**
```
Hi {name},

Your endorsement is now live: https://www.dougcharles.com/endorsements

Thank you for your support!

--
Doug Charles
```

### Technical Details
- **Public visibility:** Immediately visible on /endorsements page
- **Audit log:** ENDORSEMENT_APPROVED event logged
- **Error handling:** Fire-and-forget

---

## 📧 EMAIL #8: Endorsement Rejected

### Trigger Logic
**File:** `src/app/api/admin/endorsements/route.js` (line 174-178)
```javascript
// Admin clicks "Reject" button with optional reason
if (data?.email) {
  const reasonText = rejection_reason ? `\n\nReason: ${rejection_reason}` : '';
  await sendEmail(
    data.email,
    'Update on your endorsement submission',
    `Hi ${data.name || ''},\n\nThank you for submitting an endorsement. Unfortunately, we are unable to publish it at this time.${reasonText}\n\nIf you have questions, please feel free to reach out.\n\n--\nDoug Charles`
  ).catch(() => {});
}
```

**Conditions:**
- Admin logs into admin panel
- Admin views endorsements tab
- Admin clicks "Reject" on pending/approved endorsement
- Admin optionally provides rejection reason
- Status changes to: rejected

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Update on your endorsement submission

**Body:**
```
Hi {name},

Thank you for submitting an endorsement. Unfortunately, we are unable to publish it at this time.

Reason: {rejection_reason}

If you have questions, please feel free to reach out.

--
Doug Charles
```

### Technical Details
- **Rejection reason:** Optional field, visible in email if provided
- **Audit log:** ENDORSEMENT_REJECTED event logged
- **Database:** rejection_reason stored in endorsements table
- **⚠️ Important:** Only sent via admin UI, NOT when updating database directly

---

## 📧 EMAIL #9: Question Submission Confirmation

### Trigger Logic
**File:** `src/app/api/questions/route.js` (line 106-110)
```javascript
// Immediately after question submission
await sendEmail(
  email,
  'Thanks for your question',
  `Hi ${name},\n\nThanks for your question:\n${question}\n\nWe will follow up once it has been answered.\n\n--\nDoug Charles`
).catch(() => {});
```

**Conditions:**
- User submits question via /qna page (authenticated or public)
- Passes reCAPTCHA validation
- Question saved with status='pending'

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Thanks for your question

**Body:**
```
Hi {name},

Thanks for your question:
{question}

We will follow up once it has been answered.

--
Doug Charles
```

### Technical Details
- **Status:** pending (awaiting admin response)
- **Admin notification:** Separate email sent to NOTIFY_EMAIL
- **Error handling:** Fire-and-forget

---

## 📧 EMAIL #10: Question Answered

### Trigger Logic
**File:** `src/app/api/admin/qna/route.js` (line 124-128)
```javascript
// Admin approves question with answer
if (data?.email) {
  await sendEmail(
    data.email,
    'Your question has been answered',
    `Hi ${data.name || ''},\n\nYour question has been published: ${site}/qna\n${answer ? `\nAnswer: ${answer}` : ''}\n\nThanks for reaching out!\n\n--\nDoug Charles`
  ).catch(() => {});
}
```

**Conditions:**
- Admin logs into admin panel
- Admin views Q&A tab
- Admin adds answer text
- Admin clicks "Approve"
- Status changes: pending → approved

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Your question has been answered

**Body:**
```
Hi {name},

Your question has been published: https://www.dougcharles.com/qna

Answer: {answer}

Thanks for reaching out!

--
Doug Charles
```

### Technical Details
- **Public visibility:** Question and answer now visible on /qna page
- **Answer field:** Required before approval
- **Audit log:** QUESTION_APPROVED event logged

---

## 📧 EMAIL #11: Question Rejected

### Trigger Logic
**File:** `src/app/api/admin/qna/route.js` (line 174-177)
```javascript
// Admin rejects question
if (data?.email) {
  const reasonText = rejection_reason ? `\n\nReason: ${rejection_reason}` : '';
  await sendEmail(
    data.email,
    'Update on your question',
    `Hi ${data.name || ''},\n\nThank you for submitting your question. Unfortunately, we are unable to publish it at this time.${reasonText}\n\nIf you have other questions, please feel free to reach out.\n\n--\nDoug Charles`
  ).catch(() => {});
}
```

**Conditions:**
- Admin logs into admin panel
- Admin views Q&A tab
- Admin clicks "Reject" with optional reason
- Status changes to: rejected

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Update on your question

**Body:**
```
Hi {name},

Thank you for submitting your question. Unfortunately, we are unable to publish it at this time.

Reason: {rejection_reason}

If you have other questions, please feel free to reach out.

--
Doug Charles
```

### Technical Details
- **Rejection reason:** Optional
- **Audit log:** QUESTION_REJECTED event logged

---

## 📧 EMAIL #12: Idea Submission Confirmation

### Trigger Logic
**File:** `src/app/api/ideas/route.js` (line 241-245)
```javascript
// After supporter submits idea
await sendEmail(
  supporter.email,
  'Thanks for your idea',
  `Hi ${supporter.first_name},\n\nThank you for sharing your idea: "${title}"\n\nWe'll review it and get back to you soon.\n\n--\nDoug Charles`
).catch(() => {});
```

**Conditions:**
- User must be logged in as approved supporter
- Passes reCAPTCHA validation
- Idea saved with status='pending'

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Thanks for your idea

**Body:**
```
Hi {firstName},

Thank you for sharing your idea: "{title}"

We'll review it and get back to you soon.

--
Doug Charles
```

### Technical Details
- **Authentication:** Required (supporters only)
- **Status:** pending (awaiting admin review)
- **Admin notification:** Separate email sent to NOTIFY_EMAIL

---

## 📧 EMAIL #13: Idea Published

### Trigger Logic
**File:** `src/app/api/admin/ideas/route.js` (line 133-137)
```javascript
// Admin publishes idea
if (idea?.supporter_email) {
  const responseText = admin_response ? `\n\nDoug's response: ${admin_response}` : '';
  await sendEmail(
    idea.supporter_email,
    'Your idea has been published',
    `Hi ${idea.supporter_name || ''},\n\nYour idea "${title}" has been published: ${site}/ideas${responseText}\n\nThank you for sharing!\n\n--\nDoug Charles`
  ).catch(() => {});
}
```

**Conditions:**
- Admin logs into admin panel
- Admin views Ideas tab
- Admin selects "published" status
- Admin optionally adds response
- Status changes: pending → published

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Your idea has been published

**Body:**
```
Hi {name},

Your idea "{title}" has been published: https://www.dougcharles.com/ideas

Doug's response: {admin_response}

Thank you for sharing!

--
Doug Charles
```

### Technical Details
- **Public visibility:** Immediately visible on /ideas page
- **Admin response:** Optional, shown if provided
- **Audit log:** IDEA_PUBLISHED event logged

---

## 📧 EMAIL #14: Idea Rejected

### Trigger Logic
**File:** `src/app/api/admin/ideas/route.js` (line 182-186)
```javascript
// Admin rejects idea
if (idea?.supporter_email) {
  const reasonText = rejection_reason ? `\n\nReason: ${rejection_reason}` : '';
  await sendEmail(
    idea.supporter_email,
    'Update on your idea submission',
    `Hi ${idea.supporter_name || ''},\n\nThank you for submitting your idea "${title}". Unfortunately, we are unable to publish it at this time.${reasonText}\n\nIf you have questions, please feel free to reach out.\n\n--\nDoug Charles`
  ).catch(() => {});
}
```

**Conditions:**
- Admin logs into admin panel
- Admin views Ideas tab
- Admin selects "declined" status
- Admin optionally provides rejection reason
- Status changes to: declined

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Update on your idea submission

**Body:**
```
Hi {name},

Thank you for submitting your idea "{title}". Unfortunately, we are unable to publish it at this time.

Reason: {rejection_reason}

If you have questions, please feel free to reach out.

--
Doug Charles
```

### Technical Details
- **Status:** declined (not visible publicly)
- **Rejection reason:** Optional
- **Audit log:** IDEA_DECLINED event logged

---

## 📧 EMAIL #15: Idea Response (No Status Change)

### Trigger Logic
**File:** `src/app/api/admin/ideas/route.js` (line 201-206)
```javascript
// Admin adds response without changing status
if (idea?.supporter_email && admin_response) {
  await sendEmail(
    idea.supporter_email,
    'Response to your idea',
    `Hi ${idea.supporter_name || ''},\n\nDoug has responded to your idea "${title}":\n\n${admin_response}\n\nView your idea: ${site}/ideas\n\n--\nDoug Charles`
  ).catch(() => {});
}
```

**Conditions:**
- Admin logs into admin panel
- Admin views Ideas tab
- Admin adds/updates admin_response field
- Admin clicks "Save Response" (without changing status)

### Email Content
**From:** hello@dougcharles.com
**To:** {email}
**Subject:** Response to your idea

**Body:**
```
Hi {name},

Doug has responded to your idea "{title}":

{admin_response}

View your idea: https://www.dougcharles.com/ideas

--
Doug Charles
```

### Technical Details
- **No status change:** Idea remains in current status
- **Purpose:** Allow Doug to comment on ideas without publishing/rejecting

---

## 📧 EMAIL #16: Comment Approved

### Trigger Logic
**File:** `src/app/api/admin/comments/route.js` (line 203-209)
```javascript
// Admin approves a comment
if (comment.supporter_email) {
  await sendCommentApprovedEmail(
    comment.supporter_email,
    comment.supporter_name,
    comment.content.substring(0, 200),
    contextTitle,
    contextUrl
  );
}
```

**Conditions:**
- User submits comment on poll or idea
- Comment saved with status='pending'
- Admin logs into admin panel
- Admin clicks "Approve" on comment
- Status changes: pending → approved

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {email}
**Subject:** Your comment has been approved

**Body:**
```
Comment Approved

Hi {name}, your comment on "{contextTitle}" has been approved and is now visible.

"{commentPreview (first 200 chars)}"

[BUTTON: View the discussion]
Link: {contextUrl}

---
Doug Charles for Prosper Town Council
www.dougcharles.com

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Public visibility:** Comment now visible on poll/idea page
- **Notification trigger:** Also triggers notifications to other participants
- **Error handling:** Fire-and-forget

---

## 📧 EMAIL #17: Comment Rejected

### Trigger Logic
**File:** `src/app/api/admin/comments/route.js` (line 227-229)
```javascript
// Admin rejects comment
if (comment.supporter_email) {
  await sendCommentRejectedEmail(comment.supporter_email, comment.supporter_name, reason);
}
```

**Conditions:**
- Admin logs into admin panel
- Admin clicks "Reject" on comment
- Admin optionally provides reason
- Status changes to: rejected

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {email}
**Subject:** Comment not approved

**Body:**
```
Comment Not Approved

Hi {name}, your recent comment was not approved for posting.

Reason: {reason}

If you have questions, please contact us.

---
Doug Charles for Prosper Town Council
www.dougcharles.com

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Rejection reason:** Optional
- **Comment not visible:** Remains in rejected status
- **Error handling:** Fire-and-forget

---

## 📧 EMAIL #18: New Comment Notification (to participants)

### Trigger Logic
**File:** `src/lib/notifications.js` → `notifyParticipantsOfNewComment()` (line 89)
```javascript
// After admin approves a comment
for (const participant of participantsWithPreference) {
  await sendNewCommentNotificationEmail(
    participant.email,
    commenterName,
    comment.content.substring(0, 200),
    contextTitle,
    contextUrl,
    participant.unsubscribe_token
  );
}
```

**Conditions:**
- Admin approves a comment on a poll/idea
- Finds all users who voted on poll OR commented on same discussion
- Checks each user's `email_on_new_comment` preference = true
- Excludes the comment author (don't notify yourself)

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {participant email}
**Subject:** New comment on "{contextTitle}"

**Body:**
```
New Comment

{commenterName} commented on "{contextTitle}":

"{commentPreview (first 200 chars)}"

[BUTTON: View Discussion]
Link: {contextUrl}

---
You're receiving this because you participated in this discussion.
Unsubscribe | Manage Preferences

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Preference:** Controlled by `email_on_new_comment` in notification_preferences
- **Unsubscribe:** Includes unsubscribe link with token
- **List-Unsubscribe header:** RFC compliant
- **Error handling:** Fire-and-forget per recipient

---

## 📧 EMAIL #19: Reply Notification (to parent comment author)

### Trigger Logic
**File:** `src/lib/notifications.js` → `notifyParentCommentAuthor()` (line 138)
```javascript
// After admin approves a reply to someone's comment
if (parentAuthor.email_on_new_reply) {
  await sendNewReplyNotificationEmail(
    parentAuthor.email,
    replierName,
    reply.content.substring(0, 200),
    parentComment.content.substring(0, 200),
    contextUrl,
    parentAuthor.unsubscribe_token
  );
}
```

**Conditions:**
- Admin approves a comment that is a reply (has parent_id)
- Parent comment author has `email_on_new_reply` = true
- Parent comment author is NOT the same person (don't notify yourself)

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {parent author email}
**Subject:** Someone replied to your comment

**Body:**
```
New Reply

{replierName} replied to your comment:

Your comment:
"{parentPreview (first 200 chars)}"

{replierName}'s reply:
"{replyPreview (first 200 chars)}"

[BUTTON: View Reply]
Link: {contextUrl}

---
You're receiving this because someone replied to your comment.
Unsubscribe | Manage Preferences

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Preference:** Controlled by `email_on_new_reply` in notification_preferences
- **Unsubscribe:** Includes token
- **List-Unsubscribe header:** RFC compliant
- **Error handling:** Fire-and-forget

---

## 📧 EMAIL #20: Admin - New Supporter Registration

### Trigger Logic
**File:** `src/app/api/auth/verify-sms/route.js` (line 117)
```javascript
// After SMS verification completes
await sendAdminNewRegistrationEmail(fullSupporter);
```

**OR:** `src/app/api/auth/skip-phone/route.js` (line 142)
```javascript
// If user skips phone verification
await sendAdminNewRegistrationEmail(supporter);
```

**Conditions:**
- User completes full registration (email + phone OR skip phone)
- Supporter status changed to 'approved'
- ADMIN_EMAIL environment variable is set

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {ADMIN_EMAIL}
**Subject:** New Supporter: {firstName} {lastName}

**Body:**
```
New Supporter Registration

Name: {firstName} {lastName}
Email: {email}
Phone: {phone}
Address: {streetAddress}, {city}, {state} {zipCode}
Status: approved

[BUTTON: View in Admin Panel]
Link: https://www.dougcharles.com/admin/dashboard

---
Doug Charles Campaign Admin Notification
```

### Technical Details
- **Recipient:** ADMIN_EMAIL env var (not NOTIFY_EMAIL)
- **Purpose:** Notify admin of new registrations
- **No unsubscribe:** Admin notification

---

## 📧 EMAIL #21: Admin - New Endorsement Alert

### Trigger Logic
**File:** `src/app/api/endorsements/route.js` (line 139-142)
```javascript
// Immediately after endorsement submission
await sendNotificationEmail(
  process.env.NOTIFY_EMAIL,
  'New endorsement submitted',
  `Name: ${name}\nEmail: ${email}\nMessage: ${message || 'No message'}`
).catch(() => {});
```

**Conditions:**
- User submits endorsement (authenticated or public)
- NOTIFY_EMAIL environment variable is set

### Email Content
**From:** hello@dougcharles.com
**To:** {NOTIFY_EMAIL}
**Subject:** New endorsement submitted

**Body:**
```
Name: {name}
Email: {email}
Message: {message}
```

### Technical Details
- **Recipient:** NOTIFY_EMAIL (general notifications)
- **Purpose:** Alert admin to review pending endorsement
- **Fire-and-forget:** Silent failure if email fails

---

## 📧 EMAIL #22: Admin - New Question Alert

### Trigger Logic
**File:** `src/app/api/questions/route.js` (line 111-114)
```javascript
// Immediately after question submission
await sendNotificationEmail(
  process.env.NOTIFY_EMAIL,
  'New question submitted',
  `Name: ${name}\nEmail: ${email}\nQuestion: ${question}`
).catch(() => {});
```

**Conditions:**
- User submits question via /qna page
- NOTIFY_EMAIL environment variable is set

### Email Content
**From:** hello@dougcharles.com
**To:** {NOTIFY_EMAIL}
**Subject:** New question submitted

**Body:**
```
Name: {name}
Email: {email}
Question: {question}
```

### Technical Details
- **Recipient:** NOTIFY_EMAIL
- **Purpose:** Alert admin to answer question
- **Fire-and-forget:** Silent failure

---

## 📧 EMAIL #23: Admin - New Idea Alert

### Trigger Logic
**File:** `src/app/api/ideas/route.js` (line 246-249)
```javascript
// After supporter submits idea
await sendNotificationEmail(
  process.env.NOTIFY_EMAIL,
  'New idea submitted',
  `Name: ${supporter.first_name} ${supporter.last_name}\nEmail: ${supporter.email}\nCategory: ${category}\nTitle: ${title}\nContent: ${content}`
).catch(() => {});
```

**Conditions:**
- Logged-in supporter submits idea
- NOTIFY_EMAIL environment variable is set

### Email Content
**From:** hello@dougcharles.com
**To:** {NOTIFY_EMAIL}
**Subject:** New idea submitted

**Body:**
```
Name: {firstName} {lastName}
Email: {email}
Category: {category}
Title: {title}
Content: {content}
```

### Technical Details
- **Recipient:** NOTIFY_EMAIL
- **Purpose:** Alert admin to review idea
- **Fire-and-forget:** Silent failure

---

## 📧 EMAIL #24: Admin - Pending Comment Alert

### Trigger Logic
**File:** `src/app/api/comments/route.js` (line 275-278)
```javascript
// After user submits comment
await sendNotificationEmail(
  process.env.NOTIFY_EMAIL,
  `New ${parent_id ? 'reply' : 'comment'} pending approval`,
  `From: ${supporter.first_name} ${supporter.last_name} (${supporter.email})\nOn: ${poll ? 'Poll' : 'Idea'}\nContent: ${content}`
).catch(() => {});
```

**Conditions:**
- Logged-in supporter submits comment or reply
- Comment saved with status='pending'
- NOTIFY_EMAIL environment variable is set

### Email Content
**From:** hello@dougcharles.com
**To:** {NOTIFY_EMAIL}
**Subject:** New comment pending approval (or "New reply pending approval")

**Body:**
```
From: {firstName} {lastName} ({email})
On: Poll (or Idea)
Content: {content}
```

### Technical Details
- **Subject varies:** "comment" vs "reply" based on parent_id
- **Recipient:** NOTIFY_EMAIL
- **Purpose:** Alert admin to moderate comment
- **Fire-and-forget:** Silent failure

---

## 📧 EMAIL #25: Admin - Error Alert

### Trigger Logic
**File:** `src/lib/logging.js` → `notifySuperusersOfError()` (line 563)
```javascript
// When new error is logged
for (const admin of admins) {
  await sendErrorAlertEmail(
    admin.email,
    errorLog.id,
    errorLog.error_type,
    errorLog.error_message,
    errorLog.endpoint,
    errorLog.user_email,
    errorLog.device_info
  );
}
```

**Conditions:**
- Error logged via `logError()` function
- Error is new (not a duplicate based on deduplication logic)
- Finds all supporters with role='admin' or 'super_admin'

### Email Content
**From:** Doug Charles <hello@dougcharles.com>
**To:** {admin emails}
**Subject:** [Error Alert] {errorType}: {errorMessage}...

**Body:**
```
Website Error Alert

A new error has occurred on the campaign website:

Error ID: {errorId}
Type: {errorType}
Endpoint: {endpoint}
Message: {errorMessage}
User: {userEmail or 'Anonymous'}
Device: {device} / {browser} / {os}
Time: {timestamp}

Please review and resolve this error in the admin dashboard.

[BUTTON: View Error Details]
Link: https://www.dougcharles.com/admin/dashboard

---
Doug Charles Campaign System Alert
```

### Technical Details
- **Auto-deduplication:** If same error exists within 24h, increments occurrence_count instead of sending new email
- **All admins notified:** Sends to all admin/super_admin users
- **Device info:** Parsed from user agent
- **No unsubscribe:** Admin system notification

---

## 📱 SMS #2: Admin - Error Alert

### Trigger Logic
**File:** `src/lib/logging.js` → `notifySuperusersOfError()` (line 573)
```javascript
// Same trigger as error alert email
for (const admin of adminsWithSMS) {
  await sendErrorAlertSMS(
    admin.phone,
    errorLog.error_type,
    errorLog.error_message
  );
}
```

**Conditions:**
- Error logged via `logError()` function
- Error is new (not duplicate)
- Admin has `sms_consent = true`
- Admin has verified phone number

### SMS Content
**From:** {TELNYX_PHONE_NUMBER}
**To:** {admin phone}

**Message:**
```
[DougCharles.com Alert] {errorType}: {errorMessage (truncated to 80 chars)}
```

### Technical Details
- **Character limit:** 160 chars total
- **Truncation:** Error message truncated to fit
- **Filter:** Only admins with SMS consent
- **Provider:** Telnyx A2P 10DLC

---

## 📧 EMAIL #26: Campaign Broadcast

### Trigger Logic
**File:** `src/app/api/admin/broadcasts/route.js` (line 116-123)
```javascript
// Admin sends broadcast from admin panel
for (const supporter of supporters) {
  await sendEmail(
    supporter.email,
    subject, // Custom subject
    `Hi ${supporter.first_name},\n\n${message}\n\n--\nDoug Charles\nCandidate for Prosper Town Council, Place 5\n\nTo unsubscribe, reply with STOP.`
  );
}
```

**Conditions:**
- Admin logs into admin panel
- Admin navigates to Broadcasts
- Admin writes custom subject and message
- Admin clicks "Send Email Broadcast"
- Sends to all supporters with:
  - status = 'approved'
  - email_consent = true

### Email Content
**From:** hello@dougcharles.com
**To:** {supporter emails with consent}
**Subject:** {Custom subject by admin}

**Body:**
```
Hi {firstName},

{Custom message by admin}

--
Doug Charles
Candidate for Prosper Town Council, Place 5

To unsubscribe, reply with STOP.
```

### Technical Details
- **Rate limit:** 5 broadcasts per admin per hour
- **Batching:** Uses Promise.allSettled (all sent in parallel)
- **Tracking:** Records sent/failed counts
- **Consent required:** Only email_consent=true recipients
- **Audit log:** BROADCAST_SENT event logged

---

## 📱 SMS #3: Campaign Broadcast (DISABLED)

### Trigger Logic
**File:** `src/app/api/admin/broadcasts/route.js` (COMMENTED OUT)
```javascript
// Code exists but is disabled
// const smsSent = 0; // Hardcoded to 0
```

**Status:** Feature exists in code but is NOT active in production

**When enabled, conditions would be:**
- Admin sends broadcast from admin panel
- Admin writes SMS message (max 160 chars)
- Sends to all supporters with:
  - status = 'approved'
  - sms_consent = true
  - phone is verified

### SMS Content (if enabled)
**From:** {TELNYX_PHONE_NUMBER}
**To:** {supporter phones with consent}

**Message:**
```
{Custom message}

Reply STOP to unsubscribe.
```

### Technical Details
- **Status:** Currently disabled
- **Rate limit:** Would be 5 broadcasts per hour
- **Batching:** Sends in batches of 10 with 100ms delay
- **Consent required:** sms_consent=true
- **Provider:** Telnyx A2P 10DLC

---

## 📧 EMAIL #27: Weekly Digest (NOT ACTIVE)

### Trigger Logic
**File:** `src/lib/emailService.js` → `sendWeeklyDigestEmail()` (NOT CALLED)

**Status:** Function exists but is NOT scheduled or called anywhere in codebase

**When enabled, conditions would be:**
- Scheduled cron job runs weekly (e.g., Sunday 6 PM)
- Finds supporters who participated in polls/ideas in past 7 days
- Checks `email_on_weekly_digest` preference = true
- Sends digest of activity

### Email Content (if enabled)
**From:** Doug Charles <hello@dougcharles.com>
**To:** {participant email}
**Subject:** Weekly Activity Digest - Doug Charles for Prosper

**Body:**
```
Weekly Digest

Hi {name}, here's what happened this week on polls and ideas you participated in:

Polls:
• {poll title} — {newVotes} new votes, {totalVotes} total

Ideas:
• {idea title} — {newVotes} new votes

{X new comments on discussions you follow}

[BUTTON: View Polls]
Link: https://www.dougcharles.com/polls

---
You're receiving this weekly digest because you participated in these discussions.
Unsubscribe | Manage Preferences

Political advertising paid for by Doug Charles for Town of Prosper Town Council Place 5.
Robert Bye, Campaign Treasurer
```

### Technical Details
- **Status:** Ready but not scheduled
- **Preference:** email_on_weekly_digest
- **Unsubscribe:** Includes token
- **Implementation needed:** Vercel cron job or external scheduler

---

## SUMMARY STATISTICS

**Total Communications:** 27

### By Type:
- **User-facing emails:** 19
- **Admin notification emails:** 7
- **SMS messages:** 3 (1 active, 2 conditional)

### By Category:
- **Authentication:** 6 emails, 1 SMS
- **Endorsements:** 3 emails
- **Questions:** 3 emails
- **Ideas:** 4 emails
- **Comments:** 4 emails
- **Admin Notifications:** 7 emails, 1 SMS
- **Broadcasts:** 1 email, 1 SMS (disabled), 1 digest (disabled)

### By Status:
- **Active:** 24 communications
- **Disabled:** 2 (SMS broadcast, weekly digest)
- **Conditional:** 1 (error alert SMS only to admins with SMS consent)

---

## CONFIGURATION

### Environment Variables:
- `RESEND_API_KEY` - Email service
- `SMTP_FROM` - From address (default: `Doug Charles <hello@dougcharles.com>`)
- `ADMIN_EMAIL` - New registration notifications
- `NOTIFY_EMAIL` - General admin notifications (endorsements, questions, ideas, comments)
- `TELNYX_API_KEY` - SMS service
- `TELNYX_PHONE_NUMBER` - From phone
- `NEXT_PUBLIC_SITE_URL` - Site URL for links

### User Preferences (notification_preferences table):
- `email_on_new_comment` - Comment notifications
- `email_on_new_reply` - Reply notifications
- `email_on_weekly_digest` - Weekly digest (not active)
- `email_consent` - Campaign broadcasts
- `sms_consent` - SMS broadcasts

### Rate Limits:
- Registration: 5 per IP per hour
- SMS verification: 3 per IP per 10 minutes
- Password reset: 3 per IP per hour
- Broadcasts: 5 per admin per hour
- Voter verification: 3 per minute per IP

---

## RECOMMENDATIONS

### 1. Missing Kyle Sims Notification
**Issue:** Kyle was rejected via SQL, didn't receive email
**Fix Options:**
- A) Use admin UI to reject again (will send email)
- B) Create one-time script to send email manually

### 2. Wording Review Needed:
- **Endorsement rejection:** Very generic, could be friendlier
- **Question rejection:** Same generic wording
- **Idea rejection:** Same generic wording
- Consider adding more specific reasons or warmer language

### 3. SMS Broadcast Feature:
**Status:** Coded but disabled
**Decision needed:** Enable or remove code?

### 4. Weekly Digest:
**Status:** Function ready but not scheduled
**Decision needed:** Implement cron job or remove?

### 5. Admin Email Separation:
- **ADMIN_EMAIL:** New registrations only
- **NOTIFY_EMAIL:** All other notifications (endorsements, questions, ideas, comments, errors)
- **Recommend:** Consolidate or document clearly

---

**Document Version:** 1.0
**Last Updated:** 2026-02-10
**Author:** Claude Sonnet 4.5
