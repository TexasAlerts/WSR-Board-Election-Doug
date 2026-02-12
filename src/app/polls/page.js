import Image from 'next/image';
import Script from 'next/script';
import PollsDynamic from '../../components/PollsDynamic';
import { getSupabase } from '../../lib/supabase';

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dougcharles.com' },
    { '@type': 'ListItem', position: 2, name: 'Polls', item: 'https://www.dougcharles.com/polls' },
  ],
};

export const metadata = {
  title: 'Community Polls - Doug Charles for Prosper Town Council',
  description:
    'Share your voice on issues that matter to Prosper. Vote on community polls and see real-time results from your neighbors.',
  alternates: { canonical: '/polls' },
  openGraph: {
    title: 'Community Polls - Doug Charles for Prosper Town Council',
    description: 'Share your voice on issues that matter to Prosper. Vote on community polls and see real-time results from your neighbors.',
    url: 'https://www.dougcharles.com/polls',
    siteName: 'Doug Charles for Town of Prosper Town Council Place 5',
    locale: 'en_US',
    type: 'website',
    images: [{
      url: 'https://www.dougcharles.com/campaign-preview.webp',
      width: 1200,
      height: 630,
      alt: 'Community Polls - Doug Charles Campaign'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Polls - Doug Charles for Prosper Town Council',
    description: 'Share your voice on issues that matter to Prosper.',
    images: ['https://www.dougcharles.com/campaign-preview.webp'],
  },
};
// Enable ISR with 60 second revalidation for fresh poll data
export const revalidate = 60;

// Server component that fetches polls data
async function getPolls() {
  const supabase = getSupabase();

  // Return empty during build when Supabase isn't available
  // ISR will fetch real data on first request
  if (!supabase) {
    return [];
  }

  try {
    // Fetch active polls with their choices
    const { data: polls, error } = await supabase
      .from('polls')
      .select(
        `
        id,
        title,
        description,
        poll_type,
        status,
        visibility,
        show_results_before_vote,
        allow_comments,
        closes_at,
        created_at,
        published_at,
        poll_choices (
          id,
          choice_text,
          display_order,
          is_other_option
        )
      `
      )
      .eq('status', 'active')
      .in('visibility', ['public', 'public_view'])
      .order('published_at', { ascending: false });

    if (error) {
      return [];
    }

    // Get vote counts for each poll
    const pollIds = polls?.map((p) => p.id) || [];

    if (pollIds.length === 0) {
      return [];
    }

    const { data: voteCounts } = await supabase
      .from('poll_votes')
      .select('poll_id')
      .in('poll_id', pollIds);

    // Count votes per poll
    const voteCountMap = {};
    if (voteCounts) {
      voteCounts.forEach((v) => {
        voteCountMap[v.poll_id] = (voteCountMap[v.poll_id] || 0) + 1;
      });
    }

    // Get comment counts for each poll
    const { data: commentCounts } = await supabase
      .from('comments')
      .select('poll_id')
      .eq('status', 'approved')
      .in('poll_id', pollIds);

    // Count comments per poll
    const commentCountMap = {};
    if (commentCounts) {
      commentCounts.forEach((c) => {
        commentCountMap[c.poll_id] = (commentCountMap[c.poll_id] || 0) + 1;
      });
    }

    // Add vote counts, comment counts, and format choices
    const pollsWithCounts = polls.map((p) => ({
      ...p,
      vote_count: voteCountMap[p.id] || 0,
      comment_count: commentCountMap[p.id] || 0,
      choices: p.poll_choices?.sort((a, b) => a.display_order - b.display_order) || [],
    }));

    return pollsWithCounts;
  } catch (error) {
    return [];
  }
}

export default async function PollsPage() {
  const initialPolls = await getPolls();

  // Generate JSON-LD for polls
  const pollsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Community Polls - Doug Charles Campaign',
    description:
      'Community polls on issues that matter to Prosper residents. Share your voice and help shape local priorities.',
    url: 'https://www.dougcharles.com/polls',
    numberOfItems: initialPolls.length,
    itemListElement: initialPolls.slice(0, 10).map((poll, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Question',
        name: poll.title,
        text: poll.description || poll.title,
        answerCount: poll.vote_count || 0,
        dateCreated: poll.created_at,
        url: `https://www.dougcharles.com/polls/${poll.id}`,
      },
    })),
  };

  return (
    <div className="space-y-0">
      {/* Breadcrumb JSON-LD */}
      <Script id="polls-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* JSON-LD structured data for polls */}
      <Script
        id="polls-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pollsJsonLd) }}
      />

      {/* Hero */}
      <section className="hero-pattern hero-gradient text-center py-16 md:py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-navy/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-prosper-red/5 rounded-full blur-3xl"></div>
        </div>
        <Image
          src="/campaign-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-80 pointer-events-none"
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-navy mb-6">
            Community Polls
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Share your voice on issues that matter to Prosper
          </p>
        </div>
      </section>

      <PollsDynamic initialPolls={initialPolls} />
    </div>
  );
}
