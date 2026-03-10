import { getSupabase } from '../lib/supabase';

export default async function sitemap() {
  const baseUrl = 'https://www.dougcharles.com';
  const today = new Date();

  // Routes with their priorities and change frequencies
  const routes = [
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

  const staticRoutes = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: today,
    changeFrequency,
    priority,
  }));

  // Direct database queries instead of HTTP fetch (more reliable at build time)
  const supabase = getSupabase();

  // Fetch active polls directly from database
  let pollRoutes = [];
  if (supabase) {
    try {
      const { data: polls } = await supabase
        .from('polls')
        .select('id, published_at, created_at')
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .limit(50);

      if (polls) {
        pollRoutes = polls.map((poll) => ({
          url: `${baseUrl}/polls/${poll.id}`,
          lastModified: new Date(poll.published_at || poll.created_at),
          changeFrequency: 'daily',
          priority: 0.6,
        }));
      }
    } catch (error) {
      // Silently fail - just don't include dynamic poll routes
    }
  }

  // Fetch published ideas directly from database
  let ideaRoutes = [];
  if (supabase) {
    try {
      const { data: ideas } = await supabase
        .from('ideas')
        .select('id, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (ideas) {
        ideaRoutes = ideas.map((idea) => ({
          url: `${baseUrl}/ideas/${idea.id}`,
          lastModified: new Date(idea.created_at),
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
      }
    } catch (error) {
      // Silently fail - just don't include dynamic idea routes
    }
  }

  return [...staticRoutes, ...pollRoutes, ...ideaRoutes];
}
