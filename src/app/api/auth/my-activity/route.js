import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../lib/auth';

export async function GET(request) {
  const supabase = getSupabase();
  try {
    const supporter = await getCurrentSupporter();
    if (!supporter) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'votes';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (type === 'votes') {
      // Get polls the user voted on
      const { data, error } = await supabase
        .from('poll_votes')
        .select(`
          id,
          created_at,
          vote_data,
          other_text,
          poll_id,
          polls (
            id,
            title,
            status,
            poll_type
          )
        `)
        .eq('supporter_id', supporter.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ ok: false, error: 'Failed to fetch votes' }, { status: 500 });
      }

      // Also check voter_email for legacy votes
      const { data: emailVotes, error: emailError } = await supabase
        .from('poll_votes')
        .select(`
          id,
          created_at,
          vote_data,
          other_text,
          poll_id,
          polls (
            id,
            title,
            status,
            poll_type
          )
        `)
        .eq('voter_email', supporter.email)
        .is('supporter_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const allVotes = [...(data || []), ...(emailError ? [] : emailVotes || [])];
      // Deduplicate by poll_id
      const seen = new Set();
      const unique = allVotes.filter((v) => {
        if (seen.has(v.poll_id)) return false;
        seen.add(v.poll_id);
        return true;
      });

      return NextResponse.json({ ok: true, data: unique, type: 'votes' });
    }

    if (type === 'ideas') {
      const { data, error } = await supabase
        .from('ideas')
        .select('id, title, category, status, admin_response, upvotes, downvotes, created_at')
        .eq('supporter_id', supporter.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ ok: false, error: 'Failed to fetch ideas' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data: data || [], type: 'ideas' });
    }

    if (type === 'comments') {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          status,
          created_at,
          parent_id,
          upvotes,
          downvotes,
          poll_id,
          idea_id,
          polls (id, title),
          ideas (id, title)
        `)
        .eq('supporter_id', supporter.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return NextResponse.json({ ok: false, error: 'Failed to fetch comments' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data: data || [], type: 'comments' });
    }

    return NextResponse.json({ ok: false, error: 'Invalid type. Use: votes, ideas, or comments' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
