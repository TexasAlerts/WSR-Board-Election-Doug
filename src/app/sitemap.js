export default async function sitemap() {
  const baseUrl = 'https://www.dougcharles.com';

  // Routes with their last modification dates
  const routes = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly', lastMod: '2026-02-07' },
    { path: '/about', priority: 0.9, changeFrequency: 'monthly', lastMod: '2026-02-01' },
    { path: '/why', priority: 0.8, changeFrequency: 'monthly', lastMod: '2026-02-07' },
    { path: '/priorities', priority: 0.9, changeFrequency: 'monthly', lastMod: '2026-02-07' },
    { path: '/track-record', priority: 0.8, changeFrequency: 'monthly', lastMod: '2026-02-07' },
    { path: '/endorsements', priority: 0.8, changeFrequency: 'weekly', lastMod: '2026-02-07' },
    { path: '/qna', priority: 0.8, changeFrequency: 'weekly', lastMod: '2026-02-05' },
    { path: '/polls', priority: 0.7, changeFrequency: 'weekly', lastMod: '2026-02-07' },
    { path: '/ideas', priority: 0.7, changeFrequency: 'weekly', lastMod: '2026-02-07' },
    { path: '/get-involved', priority: 0.9, changeFrequency: 'monthly', lastMod: '2026-02-01' },
    { path: '/donate', priority: 0.8, changeFrequency: 'monthly', lastMod: '2026-02-03' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly', lastMod: '2025-12-01' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly', lastMod: '2025-12-01' },
  ];

  const staticRoutes = routes.map(({ path, priority, changeFrequency, lastMod }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(lastMod),
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
