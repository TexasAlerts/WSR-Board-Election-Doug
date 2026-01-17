-- Community Engagement Migration
-- Phase 1: Authentication System + Phase 2: Poll Updates + Phase 3: Comments

-- ============================================
-- SUPPORTERS TABLE (Full authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS supporters (
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

-- ============================================
-- EMAIL VERIFICATION TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  purpose TEXT DEFAULT 'verify' CHECK (purpose IN ('verify', 'password_reset')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SMS VERIFICATION CODES
-- ============================================
CREATE TABLE IF NOT EXISTS sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  code TEXT NOT NULL, -- 6-digit code
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VERIFIED VOTERS (lightweight for public polls)
-- ============================================
CREATE TABLE IF NOT EXISTS verified_voters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  verified_at TIMESTAMPTZ,
  verification_token TEXT,
  token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- UPDATE POLLS TABLE
-- ============================================
ALTER TABLE polls ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'authenticated'
  CHECK (visibility IN ('public', 'public_view', 'authenticated'));
ALTER TABLE polls ADD COLUMN IF NOT EXISTS notify_voters_weekly BOOLEAN DEFAULT true;
ALTER TABLE polls ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES supporters(id);

-- ============================================
-- UPDATE POLL_VOTES TABLE
-- ============================================
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS supporter_id UUID REFERENCES supporters(id);

-- ============================================
-- UPDATE COMMENTS TABLE
-- ============================================
ALTER TABLE comments ADD COLUMN IF NOT EXISTS supporter_id UUID REFERENCES supporters(id);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES supporters(id);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- ============================================
-- COMMENT VOTES (thumbs up/down)
-- ============================================
CREATE TABLE IF NOT EXISTS comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, supporter_id)
);

-- ============================================
-- UPDATE IDEAS TABLE
-- ============================================
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- ============================================
-- IDEA VOTES (up/down)
-- ============================================
CREATE TABLE IF NOT EXISTS idea_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, supporter_id)
);

-- ============================================
-- THREAD SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS thread_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id) ON DELETE CASCADE,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((poll_id IS NOT NULL AND idea_id IS NULL) OR (poll_id IS NULL AND idea_id IS NOT NULL))
);

-- ============================================
-- BROADCASTS
-- ============================================
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_type TEXT NOT NULL CHECK (broadcast_type IN ('email', 'sms', 'both')),
  subject TEXT, -- NULL for SMS-only
  body TEXT NOT NULL,
  sent_by UUID REFERENCES supporters(id),
  email_recipient_count INTEGER DEFAULT 0,
  sms_recipient_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supporter_id UUID REFERENCES supporters(id),
  event_type TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_supporters_email ON supporters(email);
CREATE INDEX IF NOT EXISTS idx_supporters_status ON supporters(status);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_supporter ON email_verifications(supporter_id);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_supporter ON sms_verifications(supporter_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_supporter ON sessions(supporter_id);
CREATE INDEX IF NOT EXISTS idx_verified_voters_email ON verified_voters(email);
CREATE INDEX IF NOT EXISTS idx_verified_voters_token ON verified_voters(verification_token);
CREATE INDEX IF NOT EXISTS idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_idea_votes_idea ON idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_supporter ON audit_logs(supporter_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event_type);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes)
-- These policies allow the service role key to bypass RLS

-- Supporters: service role full access
CREATE POLICY "Service role full access to supporters" ON supporters
  FOR ALL USING (true) WITH CHECK (true);

-- Email verifications: service role full access
CREATE POLICY "Service role full access to email_verifications" ON email_verifications
  FOR ALL USING (true) WITH CHECK (true);

-- SMS verifications: service role full access
CREATE POLICY "Service role full access to sms_verifications" ON sms_verifications
  FOR ALL USING (true) WITH CHECK (true);

-- Sessions: service role full access
CREATE POLICY "Service role full access to sessions" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

-- Verified voters: service role full access
CREATE POLICY "Service role full access to verified_voters" ON verified_voters
  FOR ALL USING (true) WITH CHECK (true);

-- Comment votes: service role full access
CREATE POLICY "Service role full access to comment_votes" ON comment_votes
  FOR ALL USING (true) WITH CHECK (true);

-- Idea votes: service role full access
CREATE POLICY "Service role full access to idea_votes" ON idea_votes
  FOR ALL USING (true) WITH CHECK (true);

-- Thread subscriptions: service role full access
CREATE POLICY "Service role full access to thread_subscriptions" ON thread_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- Broadcasts: service role full access
CREATE POLICY "Service role full access to broadcasts" ON broadcasts
  FOR ALL USING (true) WITH CHECK (true);

-- Audit logs: service role full access
CREATE POLICY "Service role full access to audit_logs" ON audit_logs
  FOR ALL USING (true) WITH CHECK (true);
