-- Query to find users with SMS verification failures
-- Run this in Supabase SQL Editor to identify users who need SMS resend

-- 1. Find all SMS-related errors from Feb 10-12, 2026
SELECT
  created_at,
  error_type,
  error_message,
  user_email,
  endpoint,
  context
FROM error_logs
WHERE
  (error_message ILIKE '%SMS%' OR endpoint ILIKE '%sms%')
  AND created_at >= '2026-02-10'
ORDER BY created_at DESC;

-- 2. Find supporters with status 'pending_phone' who may have failed SMS
SELECT
  s.id,
  s.email,
  s.first_name,
  s.last_name,
  s.phone,
  s.status,
  s.email_verified_at,
  s.created_at
FROM supporters s
WHERE
  s.status = 'pending_phone'
  AND s.email_verified_at IS NOT NULL
  AND s.created_at >= '2026-02-10'
ORDER BY s.created_at DESC;

-- 3. Check for null/empty phone numbers in pending_phone status
SELECT
  s.id,
  s.email,
  s.first_name,
  s.phone,
  s.status,
  CASE
    WHEN s.phone IS NULL THEN 'Phone is NULL'
    WHEN s.phone = '' THEN 'Phone is empty string'
    WHEN LENGTH(TRIM(s.phone)) = 0 THEN 'Phone is whitespace only'
    ELSE 'Phone exists: ' || s.phone
  END as phone_status
FROM supporters s
WHERE
  s.status = 'pending_phone'
  AND (s.phone IS NULL OR s.phone = '' OR LENGTH(TRIM(s.phone)) = 0)
ORDER BY s.created_at DESC;

-- 4. Specific user mentioned in error: phi859@hotmail.com
SELECT
  s.id,
  s.email,
  s.first_name,
  s.last_name,
  s.phone,
  s.status,
  s.email_verified_at,
  s.phone_verified_at,
  s.created_at
FROM supporters s
WHERE s.email = 'phi859@hotmail.com';
