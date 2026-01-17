-- Polls table
CREATE TABLE IF NOT EXISTS polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    poll_type TEXT DEFAULT 'single_choice' CHECK (poll_type IN ('single_choice', 'multiple_choice')),
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
    show_results_before_vote BOOLEAN DEFAULT false,
    allow_comments BOOLEAN DEFAULT true,
    closes_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Poll choices
CREATE TABLE IF NOT EXISTS poll_choices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poll votes (tracks who voted, not how they voted for privacy)
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    voter_email TEXT NOT NULL,
    vote_data JSONB NOT NULL, -- stores choice_id or choice_ids
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, voter_email) -- one vote per person per poll
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('infrastructure', 'community', 'safety', 'environment', 'general', 'question')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'under_review', 'planned', 'completed', 'declined')),
    is_public BOOLEAN DEFAULT true,
    admin_response TEXT,
    support_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea supporters
CREATE TABLE IF NOT EXISTS idea_supports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    supporter_email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(idea_id, supporter_email) -- one support per person per idea
);

-- Comments for polls and ideas
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK ((poll_id IS NOT NULL AND idea_id IS NULL) OR (poll_id IS NULL AND idea_id IS NOT NULL))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_polls_status ON polls(status);
CREATE INDEX IF NOT EXISTS idx_poll_choices_poll_id ON poll_choices(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_idea_supports_idea_id ON idea_supports(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_poll_id ON comments(poll_id);
CREATE INDEX IF NOT EXISTS idx_comments_idea_id ON comments(idea_id);

-- RLS Policies
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public can read active polls
CREATE POLICY "Public can read active polls" ON polls FOR SELECT USING (status = 'active');
CREATE POLICY "Public can read poll choices" ON poll_choices FOR SELECT USING (true);

-- Anyone can vote
CREATE POLICY "Anyone can insert votes" ON poll_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read vote counts" ON poll_votes FOR SELECT USING (true);

-- Ideas: public can read published, anyone can submit
CREATE POLICY "Public can read published ideas" ON ideas FOR SELECT USING (status IN ('published', 'under_review', 'planned', 'completed', 'declined'));
CREATE POLICY "Anyone can submit ideas" ON ideas FOR INSERT WITH CHECK (true);

-- Supports: anyone can support, public can read
CREATE POLICY "Anyone can support ideas" ON idea_supports FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read supports" ON idea_supports FOR SELECT USING (true);

-- Comments: public can read approved, anyone can submit
CREATE POLICY "Public can read approved comments" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can submit comments" ON comments FOR INSERT WITH CHECK (true);
