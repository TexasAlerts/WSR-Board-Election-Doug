import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../../lib/auth';
import { toCSV, csvResponse } from '../../../../../lib/reports';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get('poll_id');
  const format = searchParams.get('format') || 'json';

  try {
    // Get polls
    let pollQuery = supabase.from('polls').select('*').order('created_at', { ascending: false });
    if (pollId) pollQuery = pollQuery.eq('id', pollId);
    const { data: polls } = await pollQuery;

    const report = [];

    for (const poll of (polls || [])) {
      // Get choices
      const { data: choices } = await supabase
        .from('poll_choices')
        .select('id, choice_text, is_other_option, display_order')
        .eq('poll_id', poll.id)
        .order('display_order');

      // Get votes
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('vote_data, other_text, voter_email, created_at')
        .eq('poll_id', poll.id);

      // Count votes per choice
      const choiceCounts = {};
      const otherResponses = [];
      (choices || []).forEach(c => { choiceCounts[c.id] = 0; });

      (votes || []).forEach(v => {
        const data = v.vote_data;
        if (data?.choice_id) choiceCounts[data.choice_id] = (choiceCounts[data.choice_id] || 0) + 1;
        if (data?.choice_ids) data.choice_ids.forEach(id => { choiceCounts[id] = (choiceCounts[id] || 0) + 1; });
        if (v.other_text) otherResponses.push(v.other_text);
      });

      // Get comments
      const { count: commentCount } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('poll_id', poll.id)
        .eq('status', 'approved');

      const { count: pendingComments } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('poll_id', poll.id)
        .eq('status', 'pending');

      report.push({
        poll_id: poll.id,
        title: poll.title,
        poll_type: poll.poll_type,
        status: poll.status,
        total_votes: (votes || []).length,
        approved_comments: commentCount || 0,
        pending_comments: pendingComments || 0,
        choices: (choices || []).map(c => ({
          text: c.choice_text,
          is_other: c.is_other_option,
          votes: choiceCounts[c.id] || 0,
        })),
        other_responses: otherResponses,
        created_at: poll.created_at,
      });
    }

    if (format === 'csv') {
      const flat = report.flatMap(p =>
        p.choices.map(c => ({
          poll_title: p.title,
          poll_type: p.poll_type,
          status: p.status,
          total_votes: p.total_votes,
          choice: c.text,
          choice_votes: c.votes,
          is_other: c.is_other,
          approved_comments: p.approved_comments,
          pending_comments: p.pending_comments,
        }))
      );
      return csvResponse(toCSV(flat), 'poll-report.csv');
    }

    return NextResponse.json({ ok: true, data: report });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
