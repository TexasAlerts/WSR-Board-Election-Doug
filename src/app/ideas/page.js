import Image from 'next/image';
import Script from 'next/script';
import IdeasClient from '../../components/IdeasClient';
import { getSupabase } from '../../lib/supabase';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Ideas', item: 'https://www.dougcharles.com/ideas' },
  ],
};


export const metadata = {
  title: 'Community Ideas - Doug Charles, Prosper Town Council Place 5',
  description:
    'Share your ideas for making Prosper better. Submit suggestions, vote on community proposals, and help shape our town\'s future.',
  alternates: { canonical: '/ideas' },
  openGraph: {
    title: 'Community Ideas - Doug Charles, Prosper Town Council Place 5',
    description: 'Share your ideas for making Prosper better. Submit suggestions, vote on community proposals, and help shape our town\'s future.',
    url: 'https://www.dougcharles.com/ideas',
    siteName: 'Doug Charles — Prosper Town Council, Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.webp',
      width: 1200,
      height: 630,
      alt: 'Community Ideas - Doug Charles, Prosper Town Council'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Ideas - Doug Charles, Prosper Town Council Place 5',
    description: 'Share your ideas for making Prosper better. Vote on community proposals.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};
// Enable ISR with 60 second revalidation for fresh ideas data
export const revalidate = 60;

// Server component that fetches ideas data
async function getIdeas() {
  const supabase = getSupabase();

  // Return empty during build when Supabase isn't available
  // ISR will fetch real data on first request
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        'id, name, category, title, content, status, support_count, upvotes, downvotes, admin_response, created_at'
      )
      .in('status', ['published', 'under_review', 'planned', 'completed', 'declined'])
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    // Get comment counts for each idea
    let commentCountMap = {};
    if (data.length > 0) {
      const ideaIds = data.map((i) => i.id);
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('idea_id')
        .eq('status', 'approved')
        .in('idea_id', ideaIds);

      if (commentCounts) {
        commentCounts.forEach((c) => {
          commentCountMap[c.idea_id] = (commentCountMap[c.idea_id] || 0) + 1;
        });
      }
    }

    // Add comment counts to ideas
    const ideasWithComments = data.map((idea) => ({
      ...idea,
      comment_count: commentCountMap[idea.id] || 0,
    }));

    return ideasWithComments;
  } catch (error) {
    return [];
  }
}

export default async function IdeasPage() {
  const initialIdeas = await getIdeas();

  // Generate JSON-LD for community ideas
  const ideasJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Community Ideas - Doug Charles, Prosper Town Council Place 5',
    description:
      'Community-submitted ideas for making Prosper better. Vote on proposals and help shape local priorities.',
    url: 'https://www.dougcharles.com/ideas',
    numberOfItems: initialIdeas.length,
    itemListElement: initialIdeas.slice(0, 10).map((idea, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: idea.title,
        description: idea.content?.substring(0, 200) || idea.title,
        dateCreated: idea.created_at,
        url: `https://www.dougcharles.com/ideas/${idea.id}`,
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: idea.upvotes || 0,
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: idea.comment_count || 0,
          },
        ],
      },
    })),
  };

  return (
    <div className="space-y-0">
      {/* Breadcrumb JSON-LD */}
      <Script id="ideas-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* JSON-LD structured data for ideas */}
      <Script
        id="ideas-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ideasJsonLd) }}
      />

      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/dc-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-6">
            Community Ideas
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Share your ideas for making Prosper better
          </p>
        </div>
      </section>

      <IdeasClient initialIdeas={initialIdeas} />
    </div>
  );
}
