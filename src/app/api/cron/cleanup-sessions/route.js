import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

/**
 * Cron job for data retention cleanup
 *
 * Runs daily to:
 * - Delete anonymous visitor sessions older than 90 days
 * - Delete session activities older than 90 days (anonymous) or 365 days (authenticated)
 * - Delete donation events older than 180 days
 *
 * Configure in vercel.json:
 * { "crons": [{ "path": "/api/cron/cleanup-sessions", "schedule": "0 3 * * *" }] }
 */
export async function GET(request) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Require CRON_SECRET in production; optional in development
    if (!cronSecret && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 500 });
    }
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

    // Run the master cleanup function
    const { data, error } = await supabase.rpc('run_data_retention_cleanup');

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: `Cleanup cron failed: ${error.message}`,
        endpoint: '/api/cron/cleanup-sessions',
        method: 'GET',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Cleanup failed' },
        { status: 500 }
      );
    }

    const result = data?.[0] || {
      anonymous_sessions_deleted: 0,
      session_activities_deleted: 0,
      donation_events_deleted: 0,
    };

    // Log the cleanup action
    await logAudit({
      eventType: 'DATA_RETENTION_CLEANUP',
      details: {
        anonymousSessionsDeleted: result.anonymous_sessions_deleted,
        sessionActivitiesDeleted: result.session_activities_deleted,
        donationEventsDeleted: result.donation_events_deleted,
        runAt: new Date().toISOString(),
      },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      message: 'Cleanup completed successfully',
      deleted: {
        anonymousSessions: result.anonymous_sessions_deleted,
        sessionActivities: result.session_activities_deleted,
        donationEvents: result.donation_events_deleted,
      },
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/cron/cleanup-sessions',
      method: 'GET',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'Cleanup failed unexpectedly' },
      { status: 500 }
    );
  }
}
