-- Migration 013: Add rejection_reason column to questions table
-- Date: 2026-02-07
-- Purpose: Fix missing column that causes admin QnA page to fail

-- Add rejection_reason column if it doesn't exist
ALTER TABLE questions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Note: This migration is idempotent and safe to run multiple times
