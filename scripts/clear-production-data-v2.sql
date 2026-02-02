-- Clear Production Data - Keep Only Superuser
-- Based on actual database schema analysis
-- Run this in Supabase SQL Editor: https://ysoypphpoacvcluqvscx.supabase.co

-- ============================================
-- STEP 1: Verify Superuser
-- ============================================
-- First, identify your superuser account
-- This will show who will be preserved:
SELECT id, email, first_name, last_name, role, created_at
FROM supporters
WHERE role = 'super_admin';

-- ============================================
-- STEP 2: Clear Dependent Data (Foreign Keys)
-- ============================================

-- Clear thread subscriptions
DELETE FROM thread_subscriptions;

-- Clear notification preferences (keep superuser's if exists)
DELETE FROM notification_preferences
WHERE email NOT IN (
  SELECT email FROM supporters WHERE role = 'super_admin'
);

-- Clear broadcasts (optional - uncomment to delete)
-- DELETE FROM broadcasts;

-- Clear sessions (except superuser's)
DELETE FROM sessions
WHERE supporter_id NOT IN (
  SELECT id FROM supporters WHERE role = 'super_admin'
);

-- Clear email and SMS verifications
DELETE FROM email_verifications
WHERE supporter_id NOT IN (
  SELECT id FROM supporters WHERE role = 'super_admin'
);

DELETE FROM sms_verifications
WHERE supporter_id NOT IN (
  SELECT id FROM supporters WHERE role = 'super_admin'
);

-- ============================================
-- STEP 3: Clear Comment System
-- ============================================

-- Clear comment votes first (foreign key to comments)
DELETE FROM comment_votes;

-- Clear comments (including replies due to parent_id self-reference)
DELETE FROM comments;

-- ============================================
-- STEP 4: Clear Poll System
-- ============================================

-- Clear poll votes
DELETE FROM poll_votes;

-- Optionally clear poll choices and polls
-- Uncomment if you want to remove all polls:
-- DELETE FROM poll_choices;
-- DELETE FROM polls;

-- ============================================
-- STEP 5: Clear Ideas System
-- ============================================

-- Clear idea votes
DELETE FROM idea_votes;

-- Clear idea support
DELETE FROM idea_supports;

-- Optionally clear ideas themselves
-- Uncomment if you want to remove all ideas:
-- DELETE FROM ideas;

-- ============================================
-- STEP 6: Clear Public Submissions
-- ============================================

-- Clear Q&A questions
DELETE FROM questions;

-- Clear endorsements
DELETE FROM endorsements;

-- Clear interest/get-involved submissions
DELETE FROM interest;

-- ============================================
-- STEP 7: Clear Logging Tables
-- ============================================

-- Clear error logs
DELETE FROM error_logs;

-- Clear audit logs (optional - keeps history of superuser actions)
-- Uncomment if you want to clear audit trail:
-- DELETE FROM audit_logs;

-- ============================================
-- STEP 8: Clear Voters (Except Superuser)
-- ============================================

-- Clear verified voters except superuser's email
DELETE FROM verified_voters
WHERE email NOT IN (
  SELECT email FROM supporters WHERE role = 'super_admin'
);

-- ============================================
-- STEP 9: Clear Supporters (Except Superuser)
-- ============================================

-- IMPORTANT: This deletes all supporters except those with role = 'super_admin'
DELETE FROM supporters
WHERE role != 'super_admin' OR role IS NULL;

-- ============================================
-- STEP 10: Verify Cleanup Results
-- ============================================

-- Check final counts:
SELECT 'supporters' as table_name, COUNT(*) as count FROM supporters
UNION ALL
SELECT 'verified_voters', COUNT(*) FROM verified_voters
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'email_verifications', COUNT(*) FROM email_verifications
UNION ALL
SELECT 'sms_verifications', COUNT(*) FROM sms_verifications
UNION ALL
SELECT 'poll_votes', COUNT(*) FROM poll_votes
UNION ALL
SELECT 'poll_choices', COUNT(*) FROM poll_choices
UNION ALL
SELECT 'polls', COUNT(*) FROM polls
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'comment_votes', COUNT(*) FROM comment_votes
UNION ALL
SELECT 'idea_votes', COUNT(*) FROM idea_votes
UNION ALL
SELECT 'idea_supports', COUNT(*) FROM idea_supports
UNION ALL
SELECT 'ideas', COUNT(*) FROM ideas
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'endorsements', COUNT(*) FROM endorsements
UNION ALL
SELECT 'interest', COUNT(*) FROM interest
UNION ALL
SELECT 'error_logs', COUNT(*) FROM error_logs
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'thread_subscriptions', COUNT(*) FROM thread_subscriptions
UNION ALL
SELECT 'notification_preferences', COUNT(*) FROM notification_preferences
UNION ALL
SELECT 'broadcasts', COUNT(*) FROM broadcasts
ORDER BY table_name;

-- ============================================
-- EXPECTED RESULTS:
-- ============================================
-- supporters: 1 (your super_admin account)
-- verified_voters: 0 or 1 (if your email was verified)
-- sessions: 0 or 1 (current session may remain)
-- email_verifications: 0
-- sms_verifications: 0
-- poll_votes: 0
-- poll_choices: varies (kept unless uncommented)
-- polls: varies (kept unless uncommented)
-- comments: 0
-- comment_votes: 0
-- idea_votes: 0
-- idea_support: 0
-- ideas: varies (kept unless uncommented)
-- questions: 0
-- endorsements: 0
-- interest: 0
-- error_logs: 0
-- audit_logs: varies (kept by default)
-- thread_subscriptions: 0
-- notification_preferences: 0 or 1
-- broadcasts: varies (kept by default)

-- ============================================
-- VERIFY SUPERUSER STILL EXISTS:
-- ============================================
SELECT id, email, first_name, last_name, role, status
FROM supporters
WHERE role = 'super_admin';

-- This should return exactly 1 row with your account
