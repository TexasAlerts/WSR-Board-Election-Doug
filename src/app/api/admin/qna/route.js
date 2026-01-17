import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { sendEmail } from '../../../../lib/sendEmail';

export async function GET(req) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';

  let query = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function POST(req) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const body = await req.json();
  const { id, action, answer, rejection_reason } = body;

  if (!id || !action) {
    return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
  }

  const site = process.env.SITE_URL || '';

  if (action === 'approve') {
    const { data, error } = await supabase
      .from('questions')
      .update({ status: 'approved', answer: answer || null })
      .eq('id', id)
      .select('email, name, question')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (data?.email) {
      const answerText = answer ? `\n\nAnswer: ${answer}` : '';
      await sendEmail(
        data.email,
        'Your question has been answered',
        `Hi ${data.name || ''},\n\nYour question has been published: ${site}/qna${answerText}\n\nThanks for reaching out!\n\n--\nDoug Charles`
      ).catch((err) => console.error('User email failed', err));
    }
  } else if (action === 'reject') {
    const { data, error } = await supabase
      .from('questions')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('email, name, question')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (data?.email) {
      const reasonText = rejection_reason ? `\n\nReason: ${rejection_reason}` : '';
      await sendEmail(
        data.email,
        'Update on your question',
        `Hi ${data.name || ''},\n\nThank you for submitting your question. Unfortunately, we are unable to publish it at this time.${reasonText}\n\nIf you have other questions, please feel free to reach out.\n\n--\nDoug Charles`
      ).catch((err) => console.error('User email failed', err));
    }
  } else {
    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
