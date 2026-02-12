import { NextResponse } from 'next/server';
import { getSupabaseAnon, getSupabase } from '../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { verifyCaptcha } from '../../../lib/recaptcha';
import { validatePhoneNumber } from '../../../lib/phoneValidation';
import { createEmailVerification } from '../../../lib/auth';
import { sendVerificationEmail } from '../../../lib/emailService';

export async function GET() {
  const supabase = getSupabaseAnon();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('endorsements')
      .select('id,name,message,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Endorsements query error:', error.message);
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    // Handle timeout and network errors gracefully
    const isTimeout = err.message?.includes('timed out') || err.name === 'AbortError';
    console.error('Endorsements fetch error:', err.message);
    return NextResponse.json(
      { ok: false, error: isTimeout ? 'Request timed out. Please try again.' : 'Server error' },
      { status: isTimeout ? 504 : 500 }
    );
  }
}

export async function POST(req) {
  const supabase = getSupabase();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
    const schema = z.object({
      firstName: z.string().min(1, 'First name is required').max(200),
      lastName: z.string().min(1, 'Last name is required').max(200),
      email: z.string().email('Invalid email').max(200),
      phone: z.string().min(1, 'Phone is required').max(50),
      streetAddress: z.string().min(1, 'Street address is required').max(500),
      zipCode: z.string().regex(/^\d{5}$/, 'Invalid zip code').max(5),
      message: z.string().max(4000).optional().nullable(),
      consentEmail: z.boolean().optional().default(false),
      consentSms: z.boolean().optional().default(false),
      recaptchaToken: z.string().optional(),
    });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Endorsements form validation failed: ' + errorMessage,
        endpoint: '/api/endorsements',
        method: 'POST',
        request: req,
      });
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
    const { firstName, lastName, email, phone, streetAddress, zipCode, message, consentEmail, consentSms, recaptchaToken } = parsed.data;

    // Require reCAPTCHA verification
    if (!recaptchaToken) {
      return NextResponse.json(
        { ok: false, error: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }
    const captchaResult = await verifyCaptcha(recaptchaToken, 'submit_endorsement');
    if (!captchaResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: 'reCAPTCHA verification failed',
        endpoint: '/api/endorsements',
        method: 'POST',
        request: req,
      });
      return NextResponse.json(
        { ok: false, error: 'Security verification failed. Please try again.' },
        { status: 400 }
      );
    }

    // Validate and format phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { ok: false, error: 'Invalid phone number format. Please use a valid US phone number.' },
        { status: 400 }
      );
    }
    const formattedPhone = phoneValidation.formatted;

    // Full name for endorsement display
    const fullName = `${firstName} ${lastName}`;

    // Check if supporter already exists
    const { data: existingSupporter } = await supabase
      .from('supporters')
      .select('id')
      .eq('email', email)
      .single();

    let supporterId = existingSupporter?.id;

    // Create supporter record if doesn't exist
    if (!supporterId) {
      const { data: newSupporter, error: supporterError } = await supabase
        .from('supporters')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          phone: formattedPhone,
          street_address: streetAddress,
          city: 'Prosper',
          state: 'TX',
          zip_code: zipCode,
          email_consent: consentEmail,
          sms_consent: consentSms,
          consent_timestamp: new Date().toISOString(),
          status: 'pending_email',
          role: 'supporter',
        })
        .select('id')
        .single();

      if (supporterError) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: `Failed to create supporter: ${supporterError.message}`,
          endpoint: '/api/endorsements',
          method: 'POST',
          userEmail: email,
          request: req,
        });
        // Continue with endorsement even if supporter creation fails
      } else {
        supporterId = newSupporter?.id;

        // Create email verification token for new supporter
        if (supporterId) {
          const verificationToken = await createEmailVerification(supporterId, 'verify');
          if (verificationToken) {
            // Send verification email
            await sendVerificationEmail(email, firstName, verificationToken).catch((err) => {
              logError({
                errorType: ErrorTypes.EMAIL_DELIVERY,
                errorMessage: `Failed to send verification email to endorser: ${err.message}`,
                userEmail: email,
              });
            });
          }
        }
      }
    }

    const { data: endorsement, error } = await supabase
      .from('endorsements')
      .insert({
        name: fullName,
        email,
        phone: formattedPhone,
        message: message ?? null,
        status: 'pending',
        consent_email: consentEmail,
        consent_sms: consentSms,
      })
      .select('id')
      .single();

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/endorsements',
        method: 'POST',
        userEmail: email,
        request: req,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Log endorsement submission
    await logAudit({
      eventType: AuditEvents.ENDORSEMENT_SUBMITTED,
      targetId: endorsement?.id,
      targetType: 'endorsement',
      details: {
        name: fullName,
        email,
        hasPhone: !!phone,
        hasMessage: !!message,
        consentEmail,
        consentSms,
        supporterId,
      },
      request: req,
      responseStatus: 201,
    });

    // Get active polls count for the email
    const { count: activePollsCount } = await supabase
      .from('polls')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

    // Get open questions count
    const { count: openQuestionsCount } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .is('answer', null);

    const pollsText = activePollsCount > 0 ? `\n🗳️  ${activePollsCount} active community poll${activePollsCount === 1 ? '' : 's'} awaiting your vote` : '';
    const questionsText = openQuestionsCount > 0 ? `\n❓ ${openQuestionsCount} open question${openQuestionsCount === 1 ? '' : 's'} ready for discussion` : '';

    await Promise.all([
      sendEmail(
        email,
        'Thanks for your endorsement - Activate your supporter account',
        `Hi ${firstName},\n\nThank you for endorsing Doug Charles for Prosper Town Council Place 5!\n${message ? `\nYour message: "${message}"\n` : ''}\nWe will review your endorsement and notify you once it is published on the website.\n\n${'═'.repeat(60)}\n\n✅ YOU'RE NOW A CAMPAIGN SUPPORTER!\n\nAs an endorser, you've automatically been added as a campaign supporter with full access to our community engagement platform.\n\nWHY ACTIVATE YOUR ACCOUNT?\n\nOnce you verify your email and create your password, you'll be able to:\n\n✓ Vote on community polls - Your voice matters on local issues${pollsText}\n✓ Submit your own ideas for improving Prosper\n✓ Support ideas from other community members\n✓ Ask Doug questions directly and view his answers${questionsText}\n✓ Comment and engage in community discussions\n✓ Manage your notification preferences (email/SMS)\n✓ Stay informed about campaign events and updates\n\n${'═'.repeat(60)}\n\nHOW TO ACTIVATE:\n\n1. Check your inbox for a separate email with the subject "Verify your email - Doug Charles for Prosper"\n2. Click the "Verify Email & Create Password" button\n3. Create a secure password for your account\n4. Start engaging with the Prosper community!\n\n${activePollsCount > 0 || openQuestionsCount > 0 ? `\nGET STARTED NOW:\n${activePollsCount > 0 ? `• Vote on polls: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/polls\n` : ''}${openQuestionsCount > 0 ? `• Ask questions: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/qna\n` : ''}• Submit ideas: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/ideas\n• View endorsements: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/endorsements\n` : `\nExplore the community:\n• View endorsements: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/endorsements\n• Browse polls: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/polls\n• See ideas: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/ideas\n`}\n\nThank you for your support and for being part of the movement for Common Sense leadership for ALL of Prosper!\n\n--\nDoug Charles\nCandidate for Prosper Town Council Place 5\n\n---\nPaid for by Charles for Prosper. Doug Charles, Treasurer.`
      ).catch((err) => {
        logError({
          errorType: ErrorTypes.EMAIL_DELIVERY,
          errorMessage: `Failed to send endorsement confirmation: ${err.message}`,
          userEmail: email,
        });
      }),
      sendNotificationEmail(
        'New endorsement submitted',
        `Name: ${fullName}\nEmail: ${email}\nPhone: ${formattedPhone}\nAddress: ${streetAddress}, ${zipCode}\nMessage: ${message || ''}\nSupporter ID: ${supporterId || 'Not created'}\n${supporterId ? 'Verification email sent: YES' : 'Verification email sent: NO'}`
      ).catch(() => {}),
    ]);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/endorsements',
      method: 'POST',
      request: req,
    });
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 400 }
    );
  }
}
