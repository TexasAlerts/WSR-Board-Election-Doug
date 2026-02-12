/**
 * Verification Helper Functions
 * Centralized logic for email verification across interest and question submissions
 */

import { getSupabase } from './supabase';
import { generateToken } from './auth';

/**
 * Ensure a verified voter record exists for the given email.
 * If already verified, returns the existing record.
 * If not verified, creates/updates record with new verification token.
 *
 * @param {string} email - Email address (normalized lowercase)
 * @param {string} name - Full name
 * @returns {Promise<{ voterId: string, alreadyVerified: boolean, token: string | null }>}
 */
export async function ensureVerifiedVoter(email, name) {
  const supabase = getSupabase();

  // Check if verified voter already exists
  const { data: existing, error: fetchError } = await supabase
    .from('verified_voters')
    .select('id, verified_at')
    .eq('email', email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = not found, which is expected for new users
    throw new Error(`Failed to check verified voter: ${fetchError.message}`);
  }

  // If already verified, return existing record
  if (existing && existing.verified_at) {
    return {
      voterId: existing.id,
      alreadyVerified: true,
      token: null,
    };
  }

  // Generate new verification token
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24-hour expiry

  // Parse name into first_name and last_initial
  const nameParts = name.trim().split(/\s+/);
  const first_name = nameParts[0] || '';
  const last_name = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const last_initial = last_name ? last_name.charAt(0).toUpperCase() : '';

  if (existing) {
    // Update existing unverified record with new token
    const { error: updateError } = await supabase
      .from('verified_voters')
      .update({
        name,
        first_name,
        last_initial,
        verification_token: token,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', existing.id);

    if (updateError) {
      throw new Error(`Failed to update verified voter: ${updateError.message}`);
    }

    return {
      voterId: existing.id,
      alreadyVerified: false,
      token,
    };
  } else {
    // Create new verified voter record
    const { data: newVoter, error: insertError } = await supabase
      .from('verified_voters')
      .insert({
        email,
        name,
        first_name,
        last_initial,
        verification_token: token,
        token_expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Failed to create verified voter: ${insertError.message}`);
    }

    return {
      voterId: newVoter.id,
      alreadyVerified: false,
      token,
    };
  }
}

/**
 * Link all pending submissions (interest + questions) to a verified voter
 * Called after email verification completes
 *
 * @param {string} verifiedVoterId - UUID of verified voter
 * @param {string} email - Email address to match submissions
 * @returns {Promise<{ interestCount: number, questionCount: number }>}
 */
export async function linkPendingSubmissions(verifiedVoterId, email) {
  const supabase = getSupabase();

  // Update all pending interest submissions
  const { data: updatedInterests, error: interestError } = await supabase
    .from('interest')
    .update({
      verified_voter_id: verifiedVoterId,
      verification_status: 'verified',
    })
    .eq('email', email)
    .is('verified_voter_id', null)
    .select('id');

  if (interestError) {
    throw new Error(`Failed to link interest submissions: ${interestError.message}`);
  }

  // Update all pending question submissions
  const { data: updatedQuestions, error: questionError } = await supabase
    .from('questions')
    .update({
      verified_voter_id: verifiedVoterId,
      verification_status: 'verified',
    })
    .eq('email', email)
    .is('verified_voter_id', null)
    .select('id');

  if (questionError) {
    throw new Error(`Failed to link question submissions: ${questionError.message}`);
  }

  return {
    interestCount: updatedInterests?.length || 0,
    questionCount: updatedQuestions?.length || 0,
  };
}

/**
 * Get verified voter by email if exists and verified
 *
 * @param {string} email - Email address
 * @returns {Promise<{ id: string, email: string, name: string } | null>}
 */
export async function getVerifiedVoterByEmail(email) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('verified_voters')
    .select('id, email, name')
    .eq('email', email)
    .not('verified_at', 'is', null) // Must be verified
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to get verified voter: ${error.message}`);
  }

  return data;
}
