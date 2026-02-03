import IdeaDetailClient from './IdeaDetailClient';

const SITE_URL = 'https://www.dougcharles.com';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${SITE_URL}/api/ideas/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        title: 'Idea Not Found | Doug Charles for Prosper Town Council',
        description: 'This idea could not be found.',
        robots: 'noindex',
      };
    }

    const data = await res.json();

    if (!data.ok || !data.data) {
      return {
        title: 'Idea Not Found | Doug Charles for Prosper Town Council',
        description: 'This idea could not be found.',
        robots: 'noindex',
      };
    }

    const idea = data.data;
    const title = `${idea.title} | Community Ideas | Doug Charles for Prosper Town Council`;
    const description =
      idea.content.length > 160 ? idea.content.slice(0, 160) + '...' : idea.content;
    const canonical = `${SITE_URL}/ideas/${id}`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: 'Doug Charles for Prosper Town Council',
        type: 'article',
        publishedTime: idea.created_at,
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: 'Community Idea | Doug Charles for Prosper Town Council',
      description: 'View community ideas for making Prosper better.',
    };
  }
}

export default function IdeaDetailPage() {
  return <IdeaDetailClient />;
}
