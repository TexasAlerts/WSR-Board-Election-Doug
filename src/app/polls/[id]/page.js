import PollDetailClient from './PollDetailClient';

const SITE_URL = 'https://www.dougcharles.com';

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${SITE_URL}/api/polls/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        title: 'Poll Not Found | Doug Charles for Prosper Town Council',
        description: 'This poll could not be found.',
        robots: 'noindex',
      };
    }

    const data = await res.json();

    if (!data.ok || !data.data) {
      return {
        title: 'Poll Not Found | Doug Charles for Prosper Town Council',
        description: 'This poll could not be found.',
        robots: 'noindex',
      };
    }

    const poll = data.data;
    const title = `${poll.title} | Polls | Doug Charles for Prosper Town Council`;
    const description = poll.description
      ? poll.description.slice(0, 160)
      : `Vote on ${poll.title}. ${poll.total_votes} vote${poll.total_votes !== 1 ? 's' : ''} so far.`;
    const canonical = `${SITE_URL}/polls/${id}`;

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
        publishedTime: poll.published_at || poll.created_at,
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    };
  } catch (error) {
    return {
      title: 'Poll | Doug Charles for Prosper Town Council',
      description: 'View poll results and share your opinion.',
    };
  }
}

export default function PollDetailPage() {
  return <PollDetailClient />;
}
