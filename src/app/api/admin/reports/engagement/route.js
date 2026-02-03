import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../../lib/auth';
import { logError, ErrorTypes } from '../../../../../lib/logging';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    // Total verified voters
    const { count: verifiedVoters } = await supabase
      .from('verified_voters')
      .select('id', { count: 'exact', head: true })
      .not('verified_at', 'is', null);

    // Total registered supporters
    const { count: supporters } = await supabase
      .from('supporters')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved');

    // Total poll votes
    const { count: totalPollVotes } = await supabase
      .from('poll_votes')
      .select('id', { count: 'exact', head: true });

    // Total active polls
    const { count: activePolls } = await supabase
      .from('polls')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total comments
    const { count: totalComments } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: pendingComments } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Total ideas
    const { count: totalIdeas } = await supabase
      .from('ideas')
      .select('id', { count: 'exact', head: true });

    const { count: publishedIdeas } = await supabase
      .from('ideas')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');

    // Recent activity (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const since = oneWeekAgo.toISOString();

    const { count: recentVotes } = await supabase
      .from('poll_votes')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', since);

    const { count: recentComments } = await supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', since);

    const { count: recentIdeas } = await supabase
      .from('ideas')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', since);

    const { count: recentSignups } = await supabase
      .from('supporters')
      .select('id', { count: 'exact', head: true })
      .gt('created_at', since);

    return NextResponse.json({
      ok: true,
      data: {
        users: { verifiedVoters, supporters },
        polls: { activePolls, totalPollVotes },
        comments: { totalComments, pendingComments },
        ideas: { totalIdeas, publishedIdeas },
        recentActivity: {
          period: '7 days',
          votes: recentVotes,
          comments: recentComments,
          ideas: recentIdeas,
          signups: recentSignups,
        },
      },
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/reports/engagement',
      method: 'GET',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
