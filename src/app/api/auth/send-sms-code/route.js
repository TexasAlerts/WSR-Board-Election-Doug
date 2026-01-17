import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../../lib/rateLimit';
import { createSMSVerification } from '../../../../lib/auth';
import { sendVerificationSMS } from '../../../../lib/smsService';

const sendCodeSchema = z.object({
  supporterId: z.string().uuid('Invalid supporter ID'),
});

export async function POST(request) {
  const supabase = getSupabase();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 3 SMS per supporter per 10 minutes
  if (!rateLimit(`sms-${ip}`, 3, 600000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please wait before requesting another code.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = sendCodeSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { supporterId } = parsed.data;

    // Get supporter
    const { data: supporter, error: fetchError } = await supabase
      .from('supporters')
      .select('id, phone, status, first_name')
      .eq('id', supporterId)
      .single();

    if (fetchError || !supporter) {
      return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 });
    }

    if (supporter.status !== 'pending_phone') {
      return NextResponse.json(
        { ok: false, error: 'Phone verification not available for this account' },
        { status: 400 }
      );
    }

    // Create new SMS code
    const code = await createSMSVerification(supporterId, supporter.phone);
    if (!code) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create verification code' },
        { status: 500 }
      );
    }

    // Send SMS
    const smsResult = await sendVerificationSMS(supporter.phone, code);

    if (!smsResult.success) {
      console.error('SMS send error:', smsResult.error);
      return NextResponse.json(
        { ok: false, error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Verification code sent to your phone.',
    });
  } catch (err) {
    console.error('Send SMS code error:', err);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
