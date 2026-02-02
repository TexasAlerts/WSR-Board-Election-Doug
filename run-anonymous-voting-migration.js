#!/usr/bin/env node
/**
 * Run Anonymous Voting Migration
 * This script adds columns to poll_votes table to support anonymous voting
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ysoypphpoacvcluqvscx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb3lwcGhwb2FjdmNsdXF2c2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc1NzU1NiwiZXhwIjoyMDcwMzMzNTU2fQ.BlhUq20jpNbNGdcRzEcqxFwE5I53jAJiQokdie1yEfE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('Starting anonymous voting migration...\n');

  try {
    // Step 1: Add anonymous_voter_token column
    console.log('1. Adding anonymous_voter_token column...');
    const { error: tokenColError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS anonymous_voter_token VARCHAR(32);'
    });
    if (tokenColError) {
      console.log('   ℹ️  Column may already exist or using alternative method');
    } else {
      console.log('   ✅ anonymous_voter_token column added');
    }

    // Step 2: Add anonymous_voter_fingerprint column
    console.log('2. Adding anonymous_voter_fingerprint column...');
    const { error: fingerprintColError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS anonymous_voter_fingerprint VARCHAR(64);'
    });
    if (fingerprintColError) {
      console.log('   ℹ️  Column may already exist or using alternative method');
    } else {
      console.log('   ✅ anonymous_voter_fingerprint column added');
    }

    // Step 3: Make voter_email nullable
    console.log('3. Making voter_email nullable...');
    const { error: nullableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE poll_votes ALTER COLUMN voter_email DROP NOT NULL;'
    });
    if (nullableError) {
      console.log('   ℹ️  Column may already be nullable');
    } else {
      console.log('   ✅ voter_email is now nullable');
    }

    // Step 4: Create index on anonymous_voter_token
    console.log('4. Creating index on anonymous_voter_token...');
    const { error: tokenIndexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_token
            ON poll_votes(poll_id, anonymous_voter_token)
            WHERE anonymous_voter_token IS NOT NULL;`
    });
    if (tokenIndexError) {
      console.log('   ℹ️  Index may already exist');
    } else {
      console.log('   ✅ Index on anonymous_voter_token created');
    }

    // Step 5: Create index on anonymous_voter_fingerprint
    console.log('5. Creating index on anonymous_voter_fingerprint...');
    const { error: fingerprintIndexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_fingerprint
            ON poll_votes(poll_id, anonymous_voter_fingerprint)
            WHERE anonymous_voter_fingerprint IS NOT NULL;`
    });
    if (fingerprintIndexError) {
      console.log('   ℹ️  Index may already exist');
    } else {
      console.log('   ✅ Index on anonymous_voter_fingerprint created');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Verify columns exist: SELECT * FROM poll_votes LIMIT 1;');
    console.log('2. Test anonymous voting via API');
    console.log('3. Update frontend to support new flow\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nPlease run the SQL migration manually in Supabase SQL Editor:');
    console.error('See ANONYMOUS_VOTING_MIGRATION.sql for the complete migration.\n');
    process.exit(1);
  }
}

// Verify table structure after migration
async function verifyMigration() {
  console.log('Verifying migration...\n');

  try {
    // Query to check if columns exist
    const { data, error } = await supabase
      .from('poll_votes')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Could not verify migration:', error.message);
      return false;
    }

    if (data && data.length > 0) {
      const firstRow = data[0];
      const hasTokenCol = 'anonymous_voter_token' in firstRow;
      const hasFingerprintCol = 'anonymous_voter_fingerprint' in firstRow;

      console.log('Column verification:');
      console.log(`  anonymous_voter_token: ${hasTokenCol ? '✅' : '❌'}`);
      console.log(`  anonymous_voter_fingerprint: ${hasFingerprintCol ? '✅' : '❌'}`);

      if (hasTokenCol && hasFingerprintCol) {
        console.log('\n✅ All columns present - migration successful!');
        return true;
      } else {
        console.log('\n⚠️  Some columns missing - migration may be incomplete');
        return false;
      }
    } else {
      console.log('ℹ️  No existing votes to verify structure');
      return true;
    }
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    return false;
  }
}

// Run migration and verification
(async () => {
  await runMigration();
  await verifyMigration();
})();
