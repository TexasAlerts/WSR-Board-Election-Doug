import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../../lib/auth';
import { toCSV, csvResponse } from '../../../../../lib/reports';
import { logError, ErrorTypes } from '../../../../../lib/logging';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const pollId = searchParams.get('poll_id');
  const ideaId = searchParams.get('idea_id');
  const format = searchParams.get('format') || 'json';

  try {
    let query = supabase
      .from('comments')
      .select(
        'id, name, email, display_name, content, status, poll_id, idea_id, parent_id, upvotes, downvotes, rejection_reason, created_at, moderated_at, moderated_by'
      )
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);
    if (pollId) query = query.eq('poll_id', pollId);
    if (ideaId) query = query.eq('idea_id', ideaId);

    const { data: comments, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    // Get context titles
    const pollIds = [...new Set((comments || []).filter((c) => c.poll_id).map((c) => c.poll_id))];
    const ideaIds = [...new Set((comments || []).filter((c) => c.idea_id).map((c) => c.idea_id))];

    const pollTitles = {};
    const ideaTitles = {};

    if (pollIds.length > 0) {
      const { data: polls } = await supabase.from('polls').select('id, title').in('id', pollIds);
      polls?.forEach((p) => {
        pollTitles[p.id] = p.title;
      });
    }
    if (ideaIds.length > 0) {
      const { data: ideas } = await supabase.from('ideas').select('id, title').in('id', ideaIds);
      ideas?.forEach((i) => {
        ideaTitles[i.id] = i.title;
      });
    }

    const enriched = (comments || []).map((c) => ({
      ...c,
      context_type: c.poll_id ? 'poll' : 'idea',
      context_title: c.poll_id ? pollTitles[c.poll_id] : ideaTitles[c.idea_id],
      is_reply: !!c.parent_id,
    }));

    if (format === 'csv') {
      const flat = enriched.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        display_name: c.display_name,
        content: c.content,
        status: c.status,
        context_type: c.context_type,
        context_title: c.context_title,
        is_reply: c.is_reply,
        upvotes: c.upvotes,
        downvotes: c.downvotes,
        rejection_reason: c.rejection_reason || '',
        created_at: c.created_at,
        moderated_at: c.moderated_at || '',
      }));
      return csvResponse(toCSV(flat), 'comments-report.csv');
    }

    return NextResponse.json({ ok: true, data: enriched });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/reports/comments',
      method: 'GET',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
