-- Fix 500 error on GET /api/ideas/my-support caused by full table scan
-- The endpoint filters by supporter_email but no index existed for that column
CREATE INDEX IF NOT EXISTS idx_idea_supports_supporter_email
  ON idea_supports(supporter_email);
