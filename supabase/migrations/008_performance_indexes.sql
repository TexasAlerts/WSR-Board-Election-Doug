-- Migration: Add performance indexes
-- Date: 2026-02-02
-- Purpose: Add missing indexes to improve query performance

-- ============================================
-- POLL_VOTES INDEXES
-- ============================================
-- Index for looking up votes by supporter (e.g., "what polls did this supporter vote on?")
CREATE INDEX IF NOT EXISTS idx_poll_votes_supporter ON poll_votes(supporter_id);

-- ============================================
-- POLLS INDEXES
-- ============================================
-- Index for filtering polls by visibility (public, authenticated, etc.)
CREATE INDEX IF NOT EXISTS idx_polls_visibility ON polls(visibility);

-- ============================================
-- COMMENTS INDEXES
-- ============================================
-- Index for filtering comments by status (pending, approved, rejected)
-- Note: This may already exist from migration 002, but we ensure it exists
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- ============================================
-- SESSIONS INDEXES
-- ============================================
-- Index for cleaning up expired sessions efficiently
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- COMMENT_VOTES INDEXES
-- ============================================
-- Index for looking up comment votes by supporter
CREATE INDEX IF NOT EXISTS idx_comment_votes_supporter ON comment_votes(supporter_id);

-- ============================================
-- IDEA_VOTES INDEXES
-- ============================================
-- Index for looking up idea votes by supporter
CREATE INDEX IF NOT EXISTS idx_idea_votes_supporter ON idea_votes(supporter_id);
