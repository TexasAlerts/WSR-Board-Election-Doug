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
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const format = searchParams.get('format') || 'json';

  try {
    let query = supabase
      .from('ideas')
      .select('id, name, email, category, title, content, status, support_count, upvotes, downvotes, admin_response, created_at, supporter_id')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') query = query.eq('category', category);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data: ideas, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });

    // Get comment counts per idea
    const ideaIds = (ideas || []).map(i => i.id);
    const commentCounts = {};
    if (ideaIds.length > 0) {
      const { data: comments } = await supabase
        .from('comments')
        .select('idea_id')
        .in('idea_id', ideaIds)
        .eq('status', 'approved');
      comments?.forEach(c => {
        commentCounts[c.idea_id] = (commentCounts[c.idea_id] || 0) + 1;
      });
    }

    const enriched = (ideas || []).map(i => ({
      ...i,
      comment_count: commentCounts[i.id] || 0,
    }));

    if (format === 'csv') {
      const flat = enriched.map(i => ({
        id: i.id,
        name: i.name,
        email: i.email,
        category: i.category,
        title: i.title,
        content: i.content,
        status: i.status,
        support_count: i.support_count,
        upvotes: i.upvotes,
        downvotes: i.downvotes,
        comment_count: i.comment_count,
        admin_response: i.admin_response || '',
        created_at: i.created_at,
      }));
      return csvResponse(toCSV(flat), 'ideas-report.csv');
    }

    return NextResponse.json({ ok: true, data: enriched });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
