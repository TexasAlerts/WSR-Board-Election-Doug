import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { z } from 'zod';
import { withCSRF } from '../../../../lib/withCSRF';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  streetAddress: z.string().min(1, 'Street address is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().min(5, 'ZIP code is required').max(10),
});

async function patchHandler(request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  try {
    const supporter = await getCurrentSupporter();
    if (!supporter) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { firstName, lastName, streetAddress, city, state, zipCode } = parsed.data;

    const oldValues = {
      first_name: supporter.first_name,
      last_name: supporter.last_name,
      street_address: supporter.street_address,
      city: supporter.city,
      state: supporter.state,
      zip_code: supporter.zip_code,
    };

    const { error: updateError } = await supabase
      .from('supporters')
      .update({
        first_name: firstName,
        last_name: lastName,
        street_address: streetAddress,
        city,
        state,
        zip_code: zipCode,
      })
      .eq('id', supporter.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: 'Failed to update profile' }, { status: 500 });
    }

    await logAudit({
      eventType: AuditEvents.PROFILE_UPDATED,
      supporterId: supporter.id,
      oldValues,
      newValues: {
        first_name: firstName,
        last_name: lastName,
        street_address: streetAddress,
        city,
        state,
        zip_code: zipCode,
      },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true, message: 'Profile updated successfully' });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/update-profile',
      method: 'PATCH',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export const PATCH = withCSRF(patchHandler);
