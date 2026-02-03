export default async function sitemap() {
  const baseUrl = 'https://www.dougcharles.com';

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
    lastModified: new Date('2026-02-01'),
    changeFrequency,
    priority,
  }));

  // Fetch active polls
  let pollRoutes = [];
  try {
    const pollsRes = await fetch(`${baseUrl}/api/polls`, {
      cache: 'no-store',
    });
    if (pollsRes.ok) {
      const pollsData = await pollsRes.json();
      if (pollsData.ok && pollsData.data) {
        pollRoutes = pollsData.data.map((poll) => ({
          url: `${baseUrl}/polls/${poll.id}`,
          lastModified: new Date(poll.published_at || poll.created_at),
          changeFrequency: 'daily',
          priority: 0.6,
        }));
      }
    }
  } catch (error) {
    // Silently fail - just don't include dynamic poll routes
  }

  // Fetch published ideas
  let ideaRoutes = [];
  try {
    const ideasRes = await fetch(`${baseUrl}/api/ideas`, {
      cache: 'no-store',
    });
    if (ideasRes.ok) {
      const ideasData = await ideasRes.json();
      if (ideasData.ok && ideasData.data) {
        ideaRoutes = ideasData.data.map((idea) => ({
          url: `${baseUrl}/ideas/${idea.id}`,
          lastModified: new Date(idea.created_at),
          changeFrequency: 'weekly',
          priority: 0.6,
        }));
      }
    }
  } catch (error) {
    // Silently fail - just don't include dynamic idea routes
  }

  return [...staticRoutes, ...pollRoutes, ...ideaRoutes];
}
