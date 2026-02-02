-- Clear Production Data - Keep Only Superuser
-- Run this in Supabase SQL Editor
-- WARNING: This will delete all user-generated data except your superuser account

-- ============================================
-- STEP 1: Find and preserve the superuser ID
-- ============================================
-- First, let's identify the superuser (you)
-- Run this first to confirm who will be preserved:
SELECT id, email, first_name, last_name, role
FROM supporters
WHERE role = 'super_admin';

-- ============================================
-- STEP 2: Clear all poll-related data
-- ============================================

-- Clear poll votes (all votes from everyone)
DELETE FROM poll_votes;

-- Clear poll comments and their replies
DELETE FROM comment_votes;
DELETE FROM comments;

-- Optionally: Clear the polls themselves (if you want to recreate them)
-- Uncomment if you want to remove all polls:
-- DELETE FROM poll_choices;
-- DELETE FROM polls;

-- ============================================
-- STEP 3: Clear idea-related data
-- ============================================

-- Clear idea votes
DELETE FROM idea_votes;

-- Clear idea support
DELETE FROM idea_support;

-- Optionally: Clear the ideas themselves
-- Uncomment if you want to remove all ideas:
-- DELETE FROM ideas;

-- ============================================
-- STEP 4: Clear error logs
-- ============================================

DELETE FROM error_logs;

-- ============================================
-- STEP 5: Clear audit logs (optional)
-- ============================================

-- Clear audit logs (keeps superuser actions documented)
-- Uncomment if you want to clear audit trail:
-- DELETE FROM audit_logs;

-- ============================================
-- STEP 6: Clear verified voters (except superuser)
-- ============================================

-- Delete all verified voters who are NOT the superuser supporter
DELETE FROM verified_voters
WHERE email NOT IN (
  SELECT email FROM supporters WHERE role = 'super_admin'
);

-- ============================================
-- STEP 7: Clear supporters (except superuser)
-- ============================================

-- Delete all supporters except the superuser
DELETE FROM supporters
WHERE role != 'super_admin' OR role IS NULL;

-- ============================================
-- STEP 8: Clear questions
-- ============================================

-- Clear all Q&A questions
DELETE FROM questions;

-- ============================================
-- STEP 9: Clear endorsements
-- ============================================

-- Clear all endorsements
DELETE FROM endorsements;

-- ============================================
-- STEP 10: Verify cleanup
-- ============================================

-- Run these to verify what remains:
SELECT 'supporters' as table_name, COUNT(*) as count FROM supporters
UNION ALL
SELECT 'verified_voters', COUNT(*) FROM verified_voters
UNION ALL
SELECT 'poll_votes', COUNT(*) FROM poll_votes
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'comment_votes', COUNT(*) FROM comment_votes
UNION ALL
SELECT 'idea_votes', COUNT(*) FROM idea_votes
UNION ALL
SELECT 'idea_support', COUNT(*) FROM idea_support
UNION ALL
SELECT 'error_logs', COUNT(*) FROM error_logs
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'questions', COUNT(*) FROM questions
UNION ALL
SELECT 'endorsements', COUNT(*) FROM endorsements
UNION ALL
SELECT 'polls', COUNT(*) FROM polls
UNION ALL
SELECT 'poll_choices', COUNT(*) FROM poll_choices
UNION ALL
SELECT 'ideas', COUNT(*) FROM ideas
ORDER BY table_name;

-- ============================================
-- EXPECTED RESULTS AFTER CLEANUP:
-- ============================================
-- supporters: 1 (your superuser account)
-- verified_voters: 0 or 1 (if superuser email is also verified voter)
-- poll_votes: 0
-- comments: 0
-- comment_votes: 0
-- idea_votes: 0
-- idea_support: 0
-- error_logs: 0
-- audit_logs: varies (or 0 if uncommented)
-- questions: 0
-- endorsements: 0
-- polls: varies (kept by default, delete if uncommented)
-- poll_choices: varies (kept by default, delete if uncommented)
-- ideas: varies (kept by default, delete if uncommented)
