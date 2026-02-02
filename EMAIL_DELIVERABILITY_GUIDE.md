# Email Deliverability Guide
## Doug Charles for Prosper Campaign

**Last Updated:** February 2, 2026
**Status:** Phase 1 Implemented

---

## Quick Reference

### Current Configuration

- **From Address:** `Doug Charles <hello@dougcharles.com>`
- **Email Service:** Resend
- **Domain:** dougcharles.com
- **Physical Address:** Doug Charles for Prosper Town Council, 4360 Mill Branch Drive, Prosper, TX 75078

### Phase 1 Improvements ✅ COMPLETED

1. ✅ Changed FROM_EMAIL from `noreply@` to `hello@dougcharles.com`
2. ✅ Added List-Unsubscribe headers to all notification emails
3. ✅ Added physical address footer to all emails (FEC compliance)
4. ✅ Added plain text versions to all emails
5. ✅ Added engagement tracking tags

---

## DNS Records Required

### Current Records (Verify in DNS)

```
# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com include:_spf.resend.com -all
TTL: 3600

# DKIM Record
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDTMgfUzxqEMhniJ3X2ot0uvaM3UdO2/y9wbm+4yu4W+51UO5f1j3lsqHSEgcAlY4HkbFuYHVctySNrsPytBv+vpJyr0hM88Ifnvffw8se/L0+G5JfdST6BLfCoS2GTlThna4BlRTb4lvzLNsm6uMNeZuF8ZS+urE/P6IhFuZGPCQIDAQAB
TTL: Auto

# DMARC Record (UPDATED - Phase 1)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@dougcharles.com; pct=100
TTL: Auto
```

### Next Steps for DNS (Phase 2)

After 2 weeks of monitoring DMARC reports:
```
v=DMARC1; p=quarantine; rua=mailto:dmarc@dougcharles.com; pct=100
```

After 4 weeks:
```
v=DMARC1; p=reject; rua=mailto:dmarc@dougcharles.com; pct=100; adkim=s; aspf=s
```

---

## Environment Variables

Update your `.env.local` and Vercel environment:

```bash
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx
SMTP_FROM=Doug Charles <hello@dougcharles.com>
NOTIFY_EMAIL=hello@dougcharles.com
ADMIN_EMAIL=doug@dougcharles.com
```

**IMPORTANT:** Monitor hello@dougcharles.com inbox and respond to legitimate replies.

---

## Email Features Implemented

### 1. List-Unsubscribe Headers

All notification emails include:
- `List-Unsubscribe: <unsubscribe_url>`
- `List-Unsubscribe-Post: List-Unsubscribe=One-Click`

This enables Gmail/Outlook "Unsubscribe" buttons at the top of emails.

### 2. Plain Text Versions

Every HTML email includes a plain text alternative, which:
- Improves deliverability scores
- Supports text-only email clients
- Reduces spam scores

### 3. Campaign Footer

All emails include:
- Physical address (FEC requirement for political campaigns)
- Unsubscribe link
- Manage preferences link
- "Paid for by" disclaimer

### 4. Engagement Tracking

Emails are tagged with:
- `campaign: prosper-2026`
- `type: broadcast|comment-notification|reply-notification|weekly-digest`

View metrics in Resend dashboard.

---

## Testing Your Emails

### Before Sending Broadcasts

1. **Send Test to mail-tester.com:**
   ```
   Send broadcast to: test-xxxxx@mail-tester.com
   Visit: https://www.mail-tester.com
   Target Score: 8+/10
   ```

2. **Test Inbox Placement:**
   - Send to Gmail account → Check inbox vs spam
   - Send to Outlook account → Check inbox vs junk
   - Send to Yahoo account → Check inbox vs spam

3. **Check Headers:**
   - Open email in Gmail
   - Click "Show original"
   - Verify SPF: PASS, DKIM: PASS, DMARC: PASS

### Manual Checks

- [ ] FROM address is `hello@dougcharles.com` (NOT noreply@)
- [ ] Subject line is under 50 characters
- [ ] Physical address present in footer
- [ ] Unsubscribe link works
- [ ] Email displays correctly on mobile
- [ ] Plain text version is readable
- [ ] Links work correctly
- [ ] No spelling/grammar errors

---

## Monitoring Tools

### 1. Google Postmaster Tools

**Setup:**
1. Visit https://postmaster.google.com/
2. Add domain: dougcharles.com
3. Verify ownership via DNS TXT record

**What to Monitor:**
- Domain reputation (should be "High")
- IP reputation (should be "High")
- Spam rate (keep < 0.1%)
- Feedback loop complaints

### 2. Resend Dashboard

**Monitor:**
- Delivery rate (target: >98%)
- Bounce rate (keep < 2%)
- Complaint rate (keep < 0.1%)
- Open rate (political emails: 15-25%)
- Click rate (political emails: 2-5%)

### 3. DMARC Reports

**Setup:**
- Create dmarc@dougcharles.com email
- Use free DMARC analyzer: https://dmarc.postmarkapp.com/
- Review weekly aggregate reports

---

## Best Practices

### DO ✅

- Personalize emails with recipient name: `Hi ${name},`
- Keep subject lines under 50 characters
- Include clear call-to-action buttons
- Test emails before broadcasts
- Monitor bounce/complaint rates
- Reply to legitimate responses promptly
- Clean inactive subscribers quarterly
- Segment lists by engagement

### DON'T ❌

- Use ALL CAPS IN SUBJECT LINES
- Include words: "FREE!", "ACT NOW!", "CLICK HERE!"
- Use excessive exclamation marks!!!
- Send from multiple different addresses
- Include attachment files (link instead)
- Use URL shorteners (bit.ly, etc.)
- Send without unsubscribe link
- Ignore bounce reports

---

## Spam Score Red Flags

Avoid these in subject lines and content:

### High-Risk Words
- FREE, Win, Winner, Prize
- Limited time, Act now, Urgent
- Click here, Click below
- Money back, No cost, No fees
- Guarantee, Guaranteed
- Order now, Buy now
- Congratulations!

### Formatting Issues
- ALL CAPS ANYWHERE
- Multiple exclamation marks!!!
- Excessive punctuation???
- Red or green text colors
- Large font sizes (>18pt)
- Image-only emails

---

## Warmup Schedule

**Current Status:** Starting warmup

If sending large volumes, follow this schedule:

```
Week 1:   50 emails/day   (Days 1-3)
          100 emails/day  (Days 4-7)

Week 2:   250 emails/day

Week 3:   500 emails/day

Week 4+:  Full volume (1000+)
```

**Important:** Monitor bounce/complaint rates daily during warmup.

---

## Handling Bounces

### Hard Bounces (Permanent Failures)
- **Remove immediately** from list
- Examples: Invalid email, domain doesn't exist
- Keeping them hurts sender reputation

### Soft Bounces (Temporary Failures)
- **Retry up to 3 times** over 72 hours
- Examples: Mailbox full, server temporarily down
- Remove after 3 failed attempts

### Complaint (Spam Report)
- **Remove immediately** and mark as "complained"
- Never email again
- Review email content that triggered complaint

---

## Segmentation Strategy

### Engagement-Based Lists

**Highly Engaged (30 days):**
- Opened last 3 emails
- Clicked link in last 30 days
- Send: All broadcasts

**Moderately Engaged (90 days):**
- Opened 1+ email in last 90 days
- Send: Important broadcasts only

**Low Engagement (90+ days):**
- No opens in 90+ days
- Send: Re-engagement campaign
- Remove if no response after 2 attempts

---

## Re-Engagement Campaign

For low-engagement subscribers:

**Email 1:** "We miss you!"
- Subject: "Still interested in Prosper's future?"
- Ask if they want to stay subscribed
- Provide easy unsubscribe

**Email 2 (7 days later):** Last chance
- Subject: "Last chance to stay connected"
- Confirm interest or automatic removal

**Remove** if no engagement after Email 2.

---

## Emergency Procedures

### If Emails Go to Spam

1. **Stop sending immediately**
2. Check mail-tester.com score
3. Verify DNS records (SPF, DKIM, DMARC)
4. Review recent email content for spam triggers
5. Check Resend dashboard for bounce/complaint spikes
6. Contact Resend support if needed
7. Wait 24-48 hours before resuming

### If Domain Gets Blacklisted

1. **Identify blacklist:**
   - Check: https://mxtoolbox.com/blacklists.aspx
2. **Request removal:**
   - Each blacklist has removal process
   - Usually automated via website
3. **Fix underlying issue** before resuming
4. **Monitor closely** for 2 weeks

---

## Compliance Requirements

### CAN-SPAM Act (Federal)

- ✅ Include physical address
- ✅ Honor unsubscribe within 10 days
- ✅ Clear identification as advertisement/campaign
- ✅ No misleading subject lines
- ✅ Include functioning unsubscribe mechanism

### FEC Requirements (Political Campaigns)

- ✅ "Paid for by" disclaimer
- ✅ Physical mailing address
- ✅ Candidate identification
- ✅ Record keeping of all communications

---

## Phase 2 Checklist (Next 2 Weeks)

- [ ] Set up Google Postmaster Tools monitoring
- [ ] Review DMARC reports weekly
- [ ] Update DMARC policy to `p=quarantine`
- [ ] Implement engagement-based segmentation
- [ ] Create re-engagement campaign
- [ ] A/B test subject lines
- [ ] Verify SPF record updated to `-all`

## Phase 3 Checklist (Next Month)

- [ ] Upgrade DMARC to `p=reject`
- [ ] Implement send time optimization
- [ ] Create email preference center
- [ ] Add feedback survey for unsubscribers
- [ ] Review and clean inactive subscribers
- [ ] Document lessons learned

---

## Support Resources

### Resend Support
- Dashboard: https://resend.com/dashboard
- Docs: https://resend.com/docs
- Support: support@resend.com

### Testing Tools
- Mail Tester: https://www.mail-tester.com
- MX Toolbox: https://mxtoolbox.com
- DMARC Analyzer: https://dmarc.postmarkapp.com

### Learning Resources
- Resend Best Practices: https://resend.com/docs/knowledge-base/deliverability
- Google Postmaster: https://postmaster.google.com
- CAN-SPAM Compliance: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business

---

## Change Log

### February 2, 2026 - Phase 1 Implementation
- Changed FROM_EMAIL from `noreply@` to `hello@dougcharles.com`
- Added List-Unsubscribe headers to all notification emails
- Implemented plain text versions for all emails
- Added campaign footer with physical address
- Added engagement tracking tags
- Updated environment variables documentation

---

**Questions?** Contact the development team or review Resend documentation.
