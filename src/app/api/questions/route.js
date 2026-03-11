import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { sendQuestionVerificationEmail } from '../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { verifyCaptcha } from '../../../lib/recaptcha';
import { ensureVerifiedVoter, getVerifiedVoterByEmail } from '../../../lib/verificationHelpers';

// API routes should be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const { data, error } = await supabase
    .from('questions')
    .select('id, name, question, answer, created_at')
    .eq('status', 'approved')
    .not('answer', 'is', null)
    .neq('answer', '')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, data });

  // Add Cache-Control headers
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  return response;
}

export async function POST(req) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!(await rateLimit(ip))) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
    const schema = z.object({
      name: z.string().min(1, 'Name is required').max(200),
      email: z.string().email('Invalid email').max(200),
      question: z.string().min(1, 'Question is required').max(4000),
      recaptchaToken: z.string().optional(),
    });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Questions form validation failed: ' + errorMessage,
        endpoint: '/api/questions',
        method: 'POST',
        request: req,
      });
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
    const { name, email, question, recaptchaToken } = parsed.data;

    // Require reCAPTCHA verification
    if (!recaptchaToken) {
      return NextResponse.json(
        { ok: false, error: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }
    const captchaResult = await verifyCaptcha(recaptchaToken, 'submit_question');
    if (!captchaResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: 'reCAPTCHA verification failed',
        endpoint: '/api/questions',
        method: 'POST',
        request: req,
      });
      return NextResponse.json(
        { ok: false, error: 'Security verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Normalize email for consistent storage and lookups
    const normalizedEmail = email.trim().toLowerCase();

    const { data: questionRecord, error } = await supabase
      .from('questions')
      .insert({ name, email: normalizedEmail, question, status: 'pending' })
      .select('id')
      .single();
    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/questions',
        method: 'POST',
        userEmail: email,
        request: req,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
    await logAudit({
      eventType: AuditEvents.QUESTION_SUBMITTED || 'QUESTION_SUBMITTED',
      targetType: 'question',
      targetId: questionRecord?.id,
      details: { name, email },
      request: req,
      responseStatus: 201,
    });

    // Check if email is already verified
    const verifiedVoter = await getVerifiedVoterByEmail(normalizedEmail);

    if (verifiedVoter) {
      // Already verified - link immediately
      const { error: updateError } = await supabase
        .from('questions')
        .update({
          verified_voter_id: verifiedVoter.id,
          verification_status: 'verified',
        })
        .eq('id', questionRecord.id);

      // Check if update succeeded before returning success
      if (updateError) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: `Failed to link question to verified voter: ${updateError.message}`,
          endpoint: '/api/questions',
          method: 'POST',
          userEmail: email,
          request: req,
        });
        return NextResponse.json(
          { ok: false, error: 'Failed to link submission. Please try again.' },
          { status: 500 }
        );
      }

      // Send confirmation (not verification) email
      const site = process.env.SITE_URL || '';
      await Promise.all([
        sendEmail(
          normalizedEmail,
          'Thanks for your question',
          `Hi ${name},\n\nThanks for your question:\n${question}\n\nWe will follow up once it has been answered.\n\nView your submission: ${site}/qna\n\n--\nDoug Charles\n\n---\nPaid for by Charles for Prosper. Doug Charles, Treasurer.`
        ).catch((err) => {
          logError({
            errorType: ErrorTypes.EMAIL_DELIVERY,
            errorMessage: `Failed to send question confirmation email: ${err.message}`,
            userEmail: normalizedEmail,
          });
        }),
        sendNotificationEmail(
          'New question submitted',
          `Name: ${name}\nEmail: ${normalizedEmail}\nQuestion: ${question}`
        ).catch((err) => console.error('Background task failed:', err.message)),
      ]);

      return NextResponse.json({
        ok: true,
        message: "Thank you! We'll notify you when your question is answered.",
        alreadyVerified: true,
      }, { status: 201 });
    } else {
      // Not verified - create/update verified_voters record
      const { voterId, token } = await ensureVerifiedVoter(normalizedEmail, name);

      // Send verification email with question preview
      const questionPreview = question.slice(0, 100);
      const emailResult = await sendQuestionVerificationEmail(normalizedEmail, name, token, questionPreview);

      if (!emailResult.success) {
        await logError({
          errorType: ErrorTypes.EMAIL_ERROR,
          errorMessage: `Failed to send question verification email: ${emailResult.error}`,
          endpoint: '/api/questions',
          method: 'POST',
          request: req,
        });
      }

      // Send admin notification
      await sendNotificationEmail(
        'New question submitted (pending verification)',
        `Name: ${name}\nEmail: ${normalizedEmail}\nQuestion: ${question}\nStatus: Awaiting email verification`
      ).catch((err) => console.error('Background task failed:', err.message));

      return NextResponse.json({
        ok: true,
        message: 'Thank you! Please check your email (including junk/spam folder) to verify and get notified when your question is answered.',
        needsVerification: true,
      }, { status: 201 });
    }
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/questions',
      method: 'POST',
      request: req,
    });
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 400 }
    );
  }
}
