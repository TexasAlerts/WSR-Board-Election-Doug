-- Migration 014: Make phone column nullable in supporters table
-- Date: 2026-02-10
-- Purpose: Fix registration failing when phone is optional
-- Error: "Failed to create account" when phone is not provided

-- The registration form allows phone to be optional, but the database
-- has phone as NOT NULL. This mismatch causes inserts to fail.

ALTER TABLE supporters ALTER COLUMN phone DROP NOT NULL;

-- Note: This migration is idempotent and safe to run multiple times
