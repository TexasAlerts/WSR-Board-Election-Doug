import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../../../lib/rateLimit';
import { logError, ErrorTypes } from '../../../../../lib/logging';
import { withCSRF } from '../../../../../lib/withCSRF';
import { getCurrentSupporter, getVerifiedVoter } from '../../../../../lib/auth';

const idSchema = z.string().uuid('Invalid idea ID format');

async function postHandler(request, { params }) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const { id } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Validate UUID format
  const idParsed = idSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid idea ID' }, { status: 400 });
  }

  if (!(await rateLimit(ip))) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Require authentication - use session email to prevent spoofing
    const supporter = await getCurrentSupporter();
    const verifiedVoter = await getVerifiedVoter();

    let email;
    if (supporter) {
      email = supporter.email.toLowerCase();
    } else if (verifiedVoter) {
      email = verifiedVoter.email.toLowerCase();
    } else {
      return NextResponse.json(
        { ok: false, error: 'Please sign in to support ideas' },
        { status: 401 }
      );
    }

    // Check if idea exists and is public
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, support_count')
      .eq('id', id)
      .in('status', ['published', 'under_review', 'planned', 'completed', 'declined'])
      .eq('is_public', true)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ ok: false, error: 'Idea not found' }, { status: 404 });
    }

    // Check if already supported
    const { data: existingSupport } = await supabase
      .from('idea_supports')
      .select('id')
      .eq('idea_id', id)
      .eq('supporter_email', email)
      .single();

    if (existingSupport) {
      return NextResponse.json({ ok: false, error: 'Already supported' }, { status: 400 });
    }

    // Add support
    const { error: supportError } = await supabase.from('idea_supports').insert({
      idea_id: id,
      supporter_email: email,
    });

    if (supportError) {
      if (supportError.code === '23505') {
        return NextResponse.json({ ok: false, error: 'Already supported' }, { status: 400 });
      }
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Increment support count
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ support_count: idea.support_count + 1 })
      .eq('id', id);

    if (updateError) {
      // silently ignored
    }

    return NextResponse.json({ ok: true, support_count: idea.support_count + 1 }, { status: 201 });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/ideas/[id]/support',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}

async function deleteHandler(request, { params }) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const { id } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Validate UUID format
  const idParsed = idSchema.safeParse(id);
  if (!idParsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid idea ID' }, { status: 400 });
  }

  if (!(await rateLimit(ip))) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Require authentication - use session email to prevent spoofing
    const supporter = await getCurrentSupporter();
    const verifiedVoter = await getVerifiedVoter();

    let email;
    if (supporter) {
      email = supporter.email.toLowerCase();
    } else if (verifiedVoter) {
      email = verifiedVoter.email.toLowerCase();
    } else {
      return NextResponse.json(
        { ok: false, error: 'Please sign in to remove support' },
        { status: 401 }
      );
    }

    // Get current support count
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, support_count')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ ok: false, error: 'Idea not found' }, { status: 404 });
    }

    // Remove support
    const { error: deleteError } = await supabase
      .from('idea_supports')
      .delete()
      .eq('idea_id', id)
      .eq('supporter_email', email);

    if (deleteError) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Decrement support count
    const newCount = Math.max(0, idea.support_count - 1);
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ support_count: newCount })
      .eq('id', id);

    if (updateError) {
      // silently ignored
    }

    return NextResponse.json({ ok: true, support_count: newCount });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/ideas/[id]/support',
      method: 'DELETE',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}

export const POST = withCSRF(postHandler);
export const DELETE = withCSRF(deleteHandler);
