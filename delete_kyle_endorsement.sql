-- Find Kyle Sims endorsement
SELECT id, name, email, status, message, created_at 
FROM endorsements 
WHERE LOWER(name) LIKE '%kyle%sims%' OR LOWER(name) LIKE '%sims%kyle%';
