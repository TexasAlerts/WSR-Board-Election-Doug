import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { rateLimit } from '../../../../../lib/rateLimit';
import { sendNotificationEmail } from '../../../../../lib/sendEmail';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(request, { params }) {
  const { id } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();

    const schema = z.object({
      email: z.string().email('Valid email required'),
      name: z.string().min(1, 'Name required').max(200),
      choice_id: z.string().uuid().optional(),
      choice_ids: z.array(z.string().uuid()).optional(),
      comment: z.string().max(2000).optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { email, name, choice_id, choice_ids, comment } = parsed.data;

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, title, poll_type, status, allow_comments')
      .eq('id', id)
      .single();

    if (pollError || !poll || poll.status !== 'active') {
      return NextResponse.json({ ok: false, error: 'Poll not available' }, { status: 400 });
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', id)
      .eq('voter_email', email)
      .single();

    if (existingVote) {
      return NextResponse.json({ ok: false, error: 'You have already voted on this poll' }, { status: 400 });
    }

    // Build vote data
    let vote_data;
    if (poll.poll_type === 'single_choice') {
      if (!choice_id) {
        return NextResponse.json({ ok: false, error: 'Please select an option' }, { status: 400 });
      }
      vote_data = { choice_id };
    } else {
      if (!choice_ids || choice_ids.length === 0) {
        return NextResponse.json({ ok: false, error: 'Please select at least one option' }, { status: 400 });
      }
      vote_data = { choice_ids };
    }

    // Insert vote
    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: id,
        voter_email: email,
        vote_data,
        ip_address: ip,
      });

    if (voteError) {
      if (voteError.code === '23505') {
        return NextResponse.json({ ok: false, error: 'You have already voted' }, { status: 400 });
      }
      return NextResponse.json({ ok: false, error: voteError.message }, { status: 500 });
    }

    // Insert comment if provided
    if (comment && comment.trim() && poll.allow_comments) {
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          poll_id: id,
          name,
          email,
          content: comment.trim(),
          status: 'pending',
        });

      if (commentError) {
        console.error('Error saving comment:', commentError);
      } else {
        sendNotificationEmail(
          'New poll comment submitted',
          `Poll: ${poll.title}\nName: ${name}\nEmail: ${email}\nComment: ${comment.trim()}`
        ).catch(err => console.error('Admin email failed:', err));
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Vote error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
