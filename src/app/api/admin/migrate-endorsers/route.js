import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { createEmailVerification, getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { sendVerificationEmail } from '../../../../lib/emailService';
import { sendEmail } from '../../../../lib/sendEmail';
import { logError, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

/**
 * Admin endpoint to migrate existing endorsements to supporters
 * Creates supporter records and sends verification emails
 */
async function postHandler(req) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    // Get all endorsements that don't have a corresponding supporter
    const { data: endorsements, error: endorsementsError } = await supabase
      .from('endorsements')
      .select('*')
      .order('created_at', { ascending: true });

    if (endorsementsError) {
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch endorsements' },
        { status: 500 }
      );
    }

    if (!endorsements || endorsements.length === 0) {
      return NextResponse.json({
        ok: true,
        message: 'No endorsements to migrate',
        processed: 0,
        created: 0,
        skipped: 0,
        emailsSent: 0,
        errors: [],
      });
    }

    const results = {
      processed: 0,
      created: 0,
      skipped: 0,
      emailsSent: 0,
      errors: [],
    };

    // Process each endorsement
    for (const endorsement of endorsements) {
      results.processed++;

      // Normalize email
      const normalizedEmail = endorsement.email.trim().toLowerCase();

      // Check if supporter already exists
      const { data: existingSupporter } = await supabase
        .from('supporters')
        .select('id, status')
        .eq('email', normalizedEmail)
        .single();

      if (existingSupporter) {
        results.skipped++;
        continue;
      }

      // Split name into first/last
      const nameParts = endorsement.name.split(' ');
      const firstName = nameParts[0] || endorsement.name;
      const lastName = nameParts.slice(1).join(' ') || '';

      // Create supporter record
      const { data: newSupporter, error: supporterError } = await supabase
        .from('supporters')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: normalizedEmail,
          phone: endorsement.phone || '',
          street_address: '', // Old endorsements don't have this
          city: 'Prosper',
          state: 'TX',
          zip_code: '75078', // Default Prosper zip
          email_consent: endorsement.consent_email || false,
          sms_consent: endorsement.consent_sms || false,
          consent_timestamp: endorsement.created_at,
          status: 'pending_email',
          role: 'supporter',
          created_at: endorsement.created_at, // Use original endorsement date
        })
        .select('id')
        .single();

      if (supporterError) {
        results.errors.push({
          email: endorsement.email,
          error: supporterError.message,
        });
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: `Failed to create supporter during migration: ${supporterError.message}`,
          userEmail: normalizedEmail,
        });
        continue;
      }

      results.created++;
      const supporterId = newSupporter.id;

      // Create email verification token
      const verificationToken = await createEmailVerification(supporterId, 'verify');

      if (verificationToken) {
        // Send verification email
        const emailResult = await sendVerificationEmail(normalizedEmail, firstName, verificationToken);

        if (emailResult.success) {
          results.emailsSent++;

          // Also send the welcome/explanation email
          const { count: activePollsCount } = await supabase
            .from('polls')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active')
            .lte('start_date', new Date().toISOString())
            .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`);

          const { count: openQuestionsCount } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'approved')
            .is('answer', null);

          const pollsText = activePollsCount > 0 ? `\n🗳️  ${activePollsCount} active community poll${activePollsCount === 1 ? '' : 's'} awaiting your vote` : '';
          const questionsText = openQuestionsCount > 0 ? `\n❓ ${openQuestionsCount} open question${openQuestionsCount === 1 ? '' : 's'} ready for discussion` : '';

          await sendEmail(
            normalizedEmail,
            'Activate your supporter account - Doug Charles for Prosper',
            `Hi ${firstName},\n\nThank you for your earlier endorsement of Doug Charles for Prosper Town Council Place 5!\n\nWe're excited to let you know that as an endorser, you've been added as a community supporter with full access to our community engagement platform.\n\n${'═'.repeat(60)}\n\n✅ ACTIVATE YOUR SUPPORTER ACCOUNT\n\nOnce you verify your email and create your password, you'll be able to:\n\n✓ Vote on community polls - Your voice matters on local issues${pollsText}\n✓ Submit your own ideas for improving Prosper\n✓ Support ideas from other community members\n✓ Ask Doug questions directly and view his answers${questionsText}\n✓ Comment and engage in community discussions\n✓ Manage your notification preferences (email/SMS)\n✓ Stay informed about community events and updates\n\n${'═'.repeat(60)}\n\nHOW TO ACTIVATE:\n\n1. Check your inbox for an email with the subject "Verify your email - Doug Charles for Prosper"\n2. Click the "Verify Email & Create Password" button\n3. Create a secure password for your account\n4. Start engaging with the Prosper community!\n\n${activePollsCount > 0 || openQuestionsCount > 0 ? `\nGET STARTED NOW:\n${activePollsCount > 0 ? `• Vote on polls: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/polls\n` : ''}${openQuestionsCount > 0 ? `• Ask questions: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/qna\n` : ''}• Submit ideas: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/ideas\n• View endorsements: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/endorsements\n` : `\nExplore the community:\n• View endorsements: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/endorsements\n• Browse polls: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/polls\n• See ideas: ${process.env.SITE_URL || 'https://www.dougcharles.com'}/ideas\n`}\n\nThank you for your support and for being part of the movement for Common Sense leadership for ALL of Prosper!\n\n--\nDoug Charles\nIncoming Prosper Town Council Member, Place 5\n\n---\nPaid for by Charles for Prosper. Doug Charles, Treasurer.`
          ).catch((err) => {
            logError({
              errorType: ErrorTypes.EMAIL_DELIVERY,
              errorMessage: `Failed to send welcome email during migration: ${err.message}`,
              userEmail: normalizedEmail,
            });
          });
        } else {
          await logError({
            errorType: ErrorTypes.EMAIL_DELIVERY,
            errorMessage: `Failed to send verification email during migration: ${emailResult.error}`,
            userEmail: normalizedEmail,
          });
        }
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      ok: true,
      message: 'Migration completed',
      ...results,
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: `Endorser migration failed: ${err.message}`,
      errorStack: err.stack,
    });

    return NextResponse.json(
      { ok: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}

export const POST = withCSRF(postHandler);
