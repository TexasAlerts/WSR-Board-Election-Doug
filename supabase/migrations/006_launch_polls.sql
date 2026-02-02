-- Launch Polls for Campaign
-- Created: 2026-02-02
-- Polls: 1.1 (Top Issues), 1.2 (Single Issue), 2.1 (Growth Pace), 2.4 (Small-Town Character), 3.1 (Property Tax)

-- Add is_other_option column to poll_choices if it doesn't exist
ALTER TABLE poll_choices ADD COLUMN IF NOT EXISTS is_other_option BOOLEAN DEFAULT false;

-- Add other_text column to poll_votes if it doesn't exist
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS other_text TEXT;

-- Add display_name column to comments if it doesn't exist
ALTER TABLE comments ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Update poll_type check constraint to support ranked_choice
ALTER TABLE polls DROP CONSTRAINT IF EXISTS polls_poll_type_check;
ALTER TABLE polls ADD CONSTRAINT polls_poll_type_check
  CHECK (poll_type IN ('single_choice', 'multiple_choice', 'ranked_choice'));

-- Poll 1.1: Top Issues (Multiple Choice - Select Top 5)
INSERT INTO polls (id, title, description, poll_type, status, visibility, show_results_before_vote, allow_comments, published_at, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Which issues are MOST important to you when it comes to Prosper''s Town Government?',
  'Select your top 5 priorities (you can select up to 5 options)',
  'multiple_choice',
  'active',
  'public',
  false,
  true,
  NOW(),
  NOW()
);

INSERT INTO poll_choices (poll_id, choice_text, display_order) VALUES
('a0000000-0000-0000-0000-000000000001', 'Traffic congestion and road conditions', 0),
('a0000000-0000-0000-0000-000000000001', 'Property tax burden', 1),
('a0000000-0000-0000-0000-000000000001', 'Controlling apartment/multifamily development', 2),
('a0000000-0000-0000-0000-000000000001', 'Preserving Prosper''s small-town character', 3),
('a0000000-0000-0000-0000-000000000001', 'Public safety (police/fire services)', 4),
('a0000000-0000-0000-0000-000000000001', 'Water/utility costs', 5),
('a0000000-0000-0000-0000-000000000001', 'Parks and recreation facilities', 6),
('a0000000-0000-0000-0000-000000000001', 'Library services', 7),
('a0000000-0000-0000-0000-000000000001', 'Retail and restaurant options', 8),
('a0000000-0000-0000-0000-000000000001', 'Downtown/Old Town development', 9),
('a0000000-0000-0000-0000-000000000001', 'School overcrowding impacts', 10),
('a0000000-0000-0000-0000-000000000001', 'Flooding/drainage issues', 11);

-- Poll 1.2: Single Most Important Issue (Single Choice with Other)
INSERT INTO polls (id, title, description, poll_type, status, visibility, show_results_before_vote, allow_comments, published_at, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'If you could address only ONE issue facing Prosper, what would it be?',
  NULL,
  'single_choice',
  'active',
  'public',
  false,
  true,
  NOW(),
  NOW()
);

INSERT INTO poll_choices (poll_id, choice_text, display_order, is_other_option) VALUES
('a0000000-0000-0000-0000-000000000002', 'Fix traffic congestion and improve roads', 0, false),
('a0000000-0000-0000-0000-000000000002', 'Lower property taxes', 1, false),
('a0000000-0000-0000-0000-000000000002', 'Stop excessive apartment development', 2, false),
('a0000000-0000-0000-0000-000000000002', 'Maintain our small-town feel', 3, false),
('a0000000-0000-0000-0000-000000000002', 'Improve public safety response times', 4, false),
('a0000000-0000-0000-0000-000000000002', 'Control water/utility rate increases', 5, false),
('a0000000-0000-0000-0000-000000000002', 'Build better parks and recreation facilities', 6, false),
('a0000000-0000-0000-0000-000000000002', 'Expand library services', 7, false),
('a0000000-0000-0000-0000-000000000002', 'Attract more restaurants and shopping', 8, false),
('a0000000-0000-0000-0000-000000000002', 'Revitalize Downtown Prosper', 9, false),
('a0000000-0000-0000-0000-000000000002', 'Other', 10, true);

-- Poll 2.1: Growth Pace (Single Choice)
INSERT INTO polls (id, title, description, poll_type, status, visibility, show_results_before_vote, allow_comments, published_at, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000003',
  'Do you think Prosper is growing...',
  NULL,
  'single_choice',
  'active',
  'public',
  false,
  true,
  NOW(),
  NOW()
);

INSERT INTO poll_choices (poll_id, choice_text, display_order) VALUES
('a0000000-0000-0000-0000-000000000003', 'Too fast - we need to slow down development', 0),
('a0000000-0000-0000-0000-000000000003', 'At about the right pace', 1),
('a0000000-0000-0000-0000-000000000003', 'Too slow - we should encourage more growth', 2),
('a0000000-0000-0000-0000-000000000003', 'Unsure / No opinion', 3);

-- Poll 2.4: Small-Town Character (Single Choice)
INSERT INTO polls (id, title, description, poll_type, status, visibility, show_results_before_vote, allow_comments, published_at, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000004',
  'How important is it to you that Prosper maintains its "small-town character"?',
  NULL,
  'single_choice',
  'active',
  'public',
  false,
  true,
  NOW(),
  NOW()
);

INSERT INTO poll_choices (poll_id, choice_text, display_order) VALUES
('a0000000-0000-0000-0000-000000000004', 'Extremely important - it''s why I moved here', 0),
('a0000000-0000-0000-0000-000000000004', 'Very important', 1),
('a0000000-0000-0000-0000-000000000004', 'Somewhat important', 2),
('a0000000-0000-0000-0000-000000000004', 'Not very important', 3),
('a0000000-0000-0000-0000-000000000004', 'Not important at all - growth is inevitable', 4);

-- Poll 3.1: Property Tax Concern (Single Choice)
INSERT INTO polls (id, title, description, poll_type, status, visibility, show_results_before_vote, allow_comments, published_at, created_at)
VALUES (
  'a0000000-0000-0000-0000-000000000005',
  'Prosper''s median property tax bill is over $12,000 annually. How concerned are you about property taxes?',
  NULL,
  'single_choice',
  'active',
  'public',
  false,
  true,
  NOW(),
  NOW()
);

INSERT INTO poll_choices (poll_id, choice_text, display_order) VALUES
('a0000000-0000-0000-0000-000000000005', 'Extremely concerned - it''s affecting my ability to stay in Prosper', 0),
('a0000000-0000-0000-0000-000000000005', 'Very concerned', 1),
('a0000000-0000-0000-0000-000000000005', 'Somewhat concerned', 2),
('a0000000-0000-0000-0000-000000000005', 'Not very concerned', 3),
('a0000000-0000-0000-0000-000000000005', 'Not concerned at all', 4);
