#!/usr/bin/env node

/**
 * Migration Runner Script
 * Runs SQL migrations against Supabase database
 *
 * Usage: node scripts/run-migration.js <migration-file>
 * Example: node scripts/run-migration.js supabase/migrations/006_launch_polls.sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runMigration(migrationFile) {
  // Validate environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read migration file
  const migrationPath = path.resolve(process.cwd(), migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Error: Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  console.log(`\n📄 Running migration: ${path.basename(migrationFile)}`);
  console.log('─'.repeat(60));

  try {
    // Execute the migration
    // Note: Supabase client doesn't support raw SQL directly
    // We need to use the REST API to execute raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage: node scripts/run-migration.js <migration-file>

Example:
  node scripts/run-migration.js supabase/migrations/006_launch_polls.sql
`);
  process.exit(1);
}

runMigration(args[0]);
