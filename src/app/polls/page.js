import Image from 'next/image';
import PollsDynamic from '../../components/PollsDynamic';
import { getSupabase } from '../../lib/supabase';

// Enable dynamic rendering to support SSR
export const dynamic = 'force-dynamic';
// Enable ISR with 60 second revalidation
export const revalidate = 60;

// Server component that fetches polls data
async function getPolls() {
  const supabase = getSupabase();

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

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="cta-gradient text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        {/* Logo accent */}
        <Image
          src="/campaign-logo.webp"
          alt=""
          aria-hidden="true"
          width={96}
          height={64}
          className="absolute top-4 right-4 w-20 sm:w-28 md:w-32 lg:w-36 h-auto opacity-40 pointer-events-none brightness-200"
        />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Community Polls</h1>
          <p className="text-xl text-white/90">Share your voice on issues that matter to Prosper</p>
        </div>
      </section>

      <PollsDynamic initialPolls={initialPolls} />
    </div>
  );
}
