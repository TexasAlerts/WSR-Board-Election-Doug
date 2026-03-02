import { notFound } from 'next/navigation';
import IdeaDetailClient from './IdeaDetailClient';

const SITE_URL = 'https://www.dougcharles.com';

// Pre-generate static params for build-time optimization
export async function generateStaticParams() {
  try {
    const res = await fetch(`${SITE_URL}/api/ideas`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.ok || !data.data) return [];
    return data.data.slice(0, 50).map((idea) => ({
      id: idea.id.toString(),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const res = await fetch(`${SITE_URL}/api/ideas/${id}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: 'Idea Not Found | Doug Charles — Prosper Town Council, Place 5',
        description: 'This idea could not be found.',
        robots: 'noindex',
      };
    }

    const data = await res.json();

    if (!data.ok || !data.data) {
      return {
        title: 'Idea Not Found | Doug Charles — Prosper Town Council, Place 5',
        description: 'This idea could not be found.',
        robots: 'noindex',
      };
    }

    const idea = data.data;
    const title = `${idea.title} | Community Ideas | Doug Charles — Prosper Town Council, Place 5`;
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
        siteName: 'Doug Charles — Prosper Town Council, Place 5',
        type: 'article',
        publishedTime: idea.created_at,
        images: [
          {
            url: `${SITE_URL}/dc-preview.webp`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${SITE_URL}/dc-preview.webp`],
      },
    };
  } catch (error) {
    return {
      title: 'Community Idea | Doug Charles — Prosper Town Council, Place 5',
      description: 'View community ideas for making Prosper better.',
    };
  }
}

async function getIdeaExists(id) {
  try {
    const res = await fetch(`${SITE_URL}/api/ideas/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.ok && data.data;
  } catch {
    return false;
  }
}

export default async function IdeaDetailPage({ params }) {
  const { id } = await params;
  const exists = await getIdeaExists(id);

  if (!exists) {
    notFound();
  }

  return <IdeaDetailClient />;
}
