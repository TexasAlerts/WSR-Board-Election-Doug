#!/usr/bin/env node
/**
 * Verify Anonymous Voting Migration
 * Checks if the database schema supports anonymous voting
 *
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node verify-and-migrate.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  console.error('   Set these in your .env file or export them before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkCurrentSchema() {
  console.log('Checking current poll_votes table schema...\n');

  try {
    // Get one row to see structure
    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying poll_votes:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('ℹ️  No votes in database yet, checking with empty insert...');
      return {};
    }

    const firstRow = data[0];
    console.log('Current columns in poll_votes:');
    Object.keys(firstRow).forEach(col => {
      console.log(`  - ${col}`);
    });

    return firstRow;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function verifyAnonymousVotingSupport(schema) {
  console.log('\n--- Anonymous Voting Support Check ---\n');

  const hasTokenCol = schema && 'anonymous_voter_token' in schema;
  const hasFingerprintCol = schema && 'anonymous_voter_fingerprint' in schema;

  console.log(`anonymous_voter_token column: ${hasTokenCol ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`anonymous_voter_fingerprint column: ${hasFingerprintCol ? '✅ EXISTS' : '❌ MISSING'}`);

  if (hasTokenCol && hasFingerprintCol) {
    console.log('\n✅ Database is ready for anonymous voting!');
    return true;
  } else {
    console.log('\n⚠️  Migration needed!\n');
    console.log('To add anonymous voting support, run this SQL in Supabase SQL Editor:');
    console.log('');
    console.log('```sql');
    console.log('-- Add anonymous voting columns');
    console.log('ALTER TABLE poll_votes');
    console.log('ADD COLUMN IF NOT EXISTS anonymous_voter_token VARCHAR(32),');
    console.log('ADD COLUMN IF NOT EXISTS anonymous_voter_fingerprint VARCHAR(64);');
    console.log('');
    console.log('-- Make voter_email nullable');
    console.log('ALTER TABLE poll_votes ALTER COLUMN voter_email DROP NOT NULL;');
    console.log('');
    console.log('-- Create indexes');
    console.log('CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_token');
    console.log('ON poll_votes(poll_id, anonymous_voter_token)');
    console.log('WHERE anonymous_voter_token IS NOT NULL;');
    console.log('');
    console.log('CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_fingerprint');
    console.log('ON poll_votes(poll_id, anonymous_voter_fingerprint)');
    console.log('WHERE anonymous_voter_fingerprint IS NOT NULL;');
    console.log('```');
    console.log('');
    console.log('OR see ANONYMOUS_VOTING_MIGRATION.sql for the complete migration.');
    return false;
  }
}

async function testAnonymousVoteInsert() {
  console.log('\n--- Testing Anonymous Vote Insert ---\n');

  const testToken = 'test_token_' + Math.random().toString(36).substring(7);
  const testFingerprint = 'test_fingerprint_' + Math.random().toString(36).substring(7);

  try {
    // Try to insert a test anonymous vote (will fail if columns don't exist)
    const { data, error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: '00000000-0000-0000-0000-000000000000', // fake poll ID for test
        vote_data: { choice_id: '00000000-0000-0000-0000-000000000000' },
        anonymous_voter_token: testToken,
        anonymous_voter_fingerprint: testFingerprint,
        ip_address: '127.0.0.1',
      })
      .select();

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('❌ Anonymous voting columns do not exist');
        console.log('   Error:', error.message);
        return false;
      } else if (error.message.includes('violates foreign key')) {
        console.log('✅ Columns exist! (Foreign key error is expected with fake poll ID)');
        return true;
      } else {
        console.log('ℹ️  Unexpected error (columns may exist):', error.message);
        return false;
      }
    }

    // If insert succeeded, clean up
    if (data && data.length > 0) {
      await supabase
        .from('poll_votes')
        .delete()
        .eq('anonymous_voter_token', testToken);
      console.log('✅ Anonymous vote test insert successful!');
      return true;
    }

    return false;
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Main execution
(async () => {
  console.log('='.repeat(60));
  console.log('  Anonymous Voting Migration Verification');
  console.log('='.repeat(60));
  console.log('');

  const schema = await checkCurrentSchema();
  const isReady = await verifyAnonymousVotingSupport(schema);

  if (isReady) {
    await testAnonymousVoteInsert();
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('');
})();
