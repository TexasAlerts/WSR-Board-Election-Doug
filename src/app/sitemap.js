import { getSupabase } from '../lib/supabase';

/**
 * Generate sitemap including static pages and dynamic poll/idea routes
 * Fetches active polls and published ideas to include in search engine indexing
 */
export default async function sitemap() {
  const baseUrl = 'https://www.dougcharles.com';
  const supabase = getSupabase();

  // Static routes
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/why', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/priorities', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/track-record', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/endorsements', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/qna', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/polls', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/ideas', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/get-involved', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/donate', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const staticSitemap = staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date('2026-02-01'),
    changeFrequency,
    priority,
  }));

  // Fetch active polls
  const { data: polls } = await supabase
    .from('polls')
    .select('id, updated_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  const pollSitemap = (polls || []).map((poll) => ({
    url: `${baseUrl}/polls/${poll.id}`,
    lastModified: poll.updated_at ? new Date(poll.updated_at) : new Date('2026-02-01'),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Fetch published ideas
  const { data: ideas } = await supabase
    .from('ideas')
    .select('id, updated_at')
    .in('status', ['published', 'under_review', 'planned', 'completed'])
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  const ideaSitemap = (ideas || []).map((idea) => ({
    url: `${baseUrl}/ideas/${idea.id}`,
    lastModified: idea.updated_at ? new Date(idea.updated_at) : new Date('2026-02-01'),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticSitemap, ...pollSitemap, ...ideaSitemap];
}
