import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { requireAdmin } from '../../../../lib/admin-session';
import { getCurrentSupporter } from '../../../../lib/auth';

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  let query = supabase
    .from('comments')
    .select(`
      id,
      name,
      email,
      content,
      status,
      poll_id,
      idea_id,
      parent_id,
      upvotes,
      downvotes,
      rejection_reason,
      created_at,
      moderated_at,
      supporter_id
    `)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Get poll and idea titles for context
  const pollIds = [...new Set(data.filter(c => c.poll_id).map(c => c.poll_id))];
  const ideaIds = [...new Set(data.filter(c => c.idea_id).map(c => c.idea_id))];

  let pollTitles = {};
  let ideaTitles = {};

  if (pollIds.length > 0) {
    const { data: polls } = await supabase
      .from('polls')
      .select('id, title')
      .in('id', pollIds);
    if (polls) {
      polls.forEach(p => pollTitles[p.id] = p.title);
    }
  }

  if (ideaIds.length > 0) {
    const { data: ideas } = await supabase
      .from('ideas')
      .select('id, title')
      .in('id', ideaIds);
    if (ideas) {
      ideas.forEach(i => ideaTitles[i.id] = i.title);
    }
  }

  const commentsWithContext = data.map(c => ({
    ...c,
    poll_title: c.poll_id ? pollTitles[c.poll_id] : null,
    idea_title: c.idea_id ? ideaTitles[c.idea_id] : null,
  }));

  return NextResponse.json({ ok: true, data: commentsWithContext });
}

export async function PUT(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const supporter = await getCurrentSupporter();

  try {
    const body = await request.json();
    const { id, status, rejection_reason } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Comment ID required' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    const updates = {
      status,
      moderated_at: new Date().toISOString(),
      moderated_by: supporter?.id || null,
    };

    if (status === 'rejected' && rejection_reason) {
      updates.rejection_reason = rejection_reason;
    }

    const { error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
