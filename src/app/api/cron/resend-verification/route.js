import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { ensureVerifiedVoter } from '../../../../lib/verificationHelpers';
import { sendVoterVerificationEmail, sendVerificationEmail } from '../../../../lib/emailService';
import { createEmailVerification } from '../../../../lib/auth';
import { logAudit, logError, ErrorTypes } from '../../../../lib/logging';

/**
 * One-time cron job to resend verification emails to all pending users
 *
 * Targets:
 * 1. verified_voters with verified_at IS NULL (interest forms, questions, poll voters)
 * 2. supporters with status = 'pending_email' (endorsements/registrations)
 *
 * Schedule: 0 15 21 2 * (Feb 21, 2026 at 3 PM UTC = 9 AM Central)
 * Remove from vercel.json after it runs.
 */
export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { ok: false, error: 'Database connection unavailable' },
        { status: 503 }
      );
    }

    const results = {
      votersSent: 0,
      votersFailed: 0,
      supportersSent: 0,
      supportersFailed: 0,
      errors: [],
    };

    // 1. Resend to unverified voters
    const { data: pendingVoters, error: votersError } = await supabase
      .from('verified_voters')
      .select('id, email, name')
      .is('verified_at', null)
      .is('suspended_at', null);

    if (votersError) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: `Failed to query pending voters: ${votersError.message}`,
        endpoint: '/api/cron/resend-verification',
        method: 'GET',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Failed to query pending voters' },
        { status: 500 }
      );
    }

    for (const voter of pendingVoters || []) {
      try {
        // Generate fresh 24hr token
        const { token } = await ensureVerifiedVoter(voter.email, voter.name || 'Neighbor');
        if (token) {
          const emailResult = await sendVoterVerificationEmail(
            voter.email,
            voter.name || 'Neighbor',
            token
          );
          if (emailResult.success) {
            results.votersSent++;
          } else {
            results.votersFailed++;
            results.errors.push(`voter ${voter.email}: ${emailResult.error}`);
          }
        }
        // Rate limit: 600ms between sends (Resend allows 2 req/sec)
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (err) {
        results.votersFailed++;
        results.errors.push(`voter ${voter.email}: ${err.message}`);
      }
    }

    // 2. Resend to pending supporters
    const { data: pendingSupporters, error: supportersError } = await supabase
      .from('supporters')
      .select('id, email, first_name')
      .eq('status', 'pending_email');

    if (supportersError) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: `Failed to query pending supporters: ${supportersError.message}`,
        endpoint: '/api/cron/resend-verification',
        method: 'GET',
        request,
      });
    }

    for (const supporter of pendingSupporters || []) {
      try {
        const token = await createEmailVerification(supporter.id, 'verify');
        if (token) {
          const emailResult = await sendVerificationEmail(
            supporter.email,
            supporter.first_name || 'Supporter',
            token
          );
          if (emailResult.success) {
            results.supportersSent++;
          } else {
            results.supportersFailed++;
            results.errors.push(`supporter ${supporter.email}: ${emailResult.error}`);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        results.supportersFailed++;
        results.errors.push(`supporter ${supporter.email}: ${err.message}`);
      }
    }

    await logAudit({
      eventType: 'VERIFICATION_REMINDER_SENT',
      details: {
        votersSent: results.votersSent,
        votersFailed: results.votersFailed,
        supportersSent: results.supportersSent,
        supportersFailed: results.supportersFailed,
        totalPendingVoters: pendingVoters?.length || 0,
        totalPendingSupporters: pendingSupporters?.length || 0,
        runAt: new Date().toISOString(),
      },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      message: 'Verification reminder emails sent',
      results: {
        voters: { sent: results.votersSent, failed: results.votersFailed },
        supporters: { sent: results.supportersSent, failed: results.supportersFailed },
        errors: results.errors,
      },
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/cron/resend-verification',
      method: 'GET',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'Verification reminder failed unexpectedly' },
      { status: 500 }
    );
  }
}
