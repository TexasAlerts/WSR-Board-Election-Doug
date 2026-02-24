-- Fix overly permissive UPDATE policy on site_settings
-- Drop the old policy that allowed any role to update
DROP POLICY IF EXISTS "Service role can update site_settings" ON site_settings;

-- Create restrictive policy (service role bypasses RLS, so this blocks anon/authenticated)
CREATE POLICY "No public updates to site_settings"
  ON site_settings FOR UPDATE
  USING (false)
  WITH CHECK (false);
