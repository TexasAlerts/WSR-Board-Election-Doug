export default function sitemap() {
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

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date('2026-02-01'),
    changeFrequency,
    priority,
  }));
}
