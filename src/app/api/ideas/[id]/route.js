import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  const { id } = await params;

  const { data: idea, error } = await supabase
    .from('ideas')
    .select('id, name, category, title, content, status, support_count, admin_response, created_at')
    .eq('id', id)
    .in('status', ['published', 'under_review', 'planned', 'completed', 'declined'])
    .eq('is_public', true)
    .single();

  if (error || !idea) {
    return NextResponse.json({ ok: false, error: 'Idea not found' }, { status: 404 });
  }

  // Get approved comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id, name, content, created_at')
    .eq('idea_id', id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  return NextResponse.json({
    ok: true,
    data: {
      ...idea,
      comments: comments || [],
    },
  });
}
