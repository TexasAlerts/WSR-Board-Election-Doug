#!/usr/bin/env node
/**
 * Run Anonymous Voting Database Migration
 * Executes the SQL migration to add anonymous voting columns
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  console.error('   Set these in your .env file or export them before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('='.repeat(60));
console.log('  Running Anonymous Voting Database Migration');
console.log('='.repeat(60));
console.log('');

async function runMigration() {
  try {
    console.log('Step 1: Adding anonymous_voter_token column...');
    const { error: tokenError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS anonymous_voter_token VARCHAR(32);'
    });

    if (tokenError && !tokenError.message.includes('already exists')) {
      console.error('❌ Error adding token column:', tokenError.message);
      return false;
    }
    console.log('✅ Token column added');

    console.log('\nStep 2: Adding anonymous_voter_fingerprint column...');
    const { error: fingerprintError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS anonymous_voter_fingerprint VARCHAR(64);'
    });

    if (fingerprintError && !fingerprintError.message.includes('already exists')) {
      console.error('❌ Error adding fingerprint column:', fingerprintError.message);
      return false;
    }
    console.log('✅ Fingerprint column added');

    console.log('\nStep 3: Making voter_email nullable...');
    const { error: nullableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE poll_votes ALTER COLUMN voter_email DROP NOT NULL;'
    });

    if (nullableError && !nullableError.message.includes('does not exist')) {
      console.error('❌ Error making email nullable:', nullableError.message);
      return false;
    }
    console.log('✅ voter_email is now nullable');

    console.log('\nStep 4: Creating index on anonymous_voter_token...');
    const { error: tokenIndexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_token
            ON poll_votes(poll_id, anonymous_voter_token)
            WHERE anonymous_voter_token IS NOT NULL;`
    });

    if (tokenIndexError && !tokenIndexError.message.includes('already exists')) {
      console.error('❌ Error creating token index:', tokenIndexError.message);
      return false;
    }
    console.log('✅ Token index created');

    console.log('\nStep 5: Creating index on anonymous_voter_fingerprint...');
    const { error: fingerprintIndexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_poll_votes_anonymous_fingerprint
            ON poll_votes(poll_id, anonymous_voter_fingerprint)
            WHERE anonymous_voter_fingerprint IS NOT NULL;`
    });

    if (fingerprintIndexError && !fingerprintIndexError.message.includes('already exists')) {
      console.error('❌ Error creating fingerprint index:', fingerprintIndexError.message);
      return false;
    }
    console.log('✅ Fingerprint index created');

    console.log('\n✅ Migration completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

// Execute migration
runMigration().then(success => {
  console.log('');
  console.log('='.repeat(60));
  if (success) {
    console.log('  Anonymous voting is now enabled!');
    console.log('  Run verify-and-migrate.mjs to confirm.');
  } else {
    console.log('  Migration encountered errors. See above for details.');
  }
  console.log('='.repeat(60));
  console.log('');
});
