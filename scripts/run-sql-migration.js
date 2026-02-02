#!/usr/bin/env node

/**
 * Run SQL Migration via Supabase Direct
 * Executes SQL migration files directly against Supabase database
 *
 * Usage: node scripts/run-sql-migration.js supabase/migrations/006_launch_polls.sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ysoypphpoacvcluqvscx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb3lwcGhwb2FjdmNsdXF2c2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc1NzU1NiwiZXhwIjoyMDcwMzMzNTU2fQ.BlhUq20jpNbNGdcRzEcqxFwE5I53jAJiQokdie1yEfE';

async function runMigration(migrationFile) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Read migration file
  const migrationPath = path.resolve(process.cwd(), migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Error: Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');
  console.log(`\n📄 Running migration: ${path.basename(migrationFile)}`);
  console.log('─'.repeat(60));

  // Split SQL into individual statements (basic split on semicolons)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    process.stdout.write(`${i + 1}. ${preview}...`);

    try {
      // Use rpc to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: stmt + ';'
      });

      if (error) {
        // If exec_sql doesn't exist, try direct query
        if (error.message.includes('function') || error.code === '42883') {
          console.log(' ⚠️  (using fallback method)');
          // For most statements, we need to use the Supabase dashboard
          console.log('    → Skipping (requires Supabase dashboard SQL editor)');
          continue;
        }
        throw error;
      }

      console.log(' ✅');
      successCount++;
    } catch (error) {
      console.log(` ❌`);
      console.error(`    Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount}`);
  }

  if (errorCount === statements.length) {
    console.log(`\n⚠️  All statements failed. Please run this migration manually:`);
    console.log(`   1. Go to: ${SUPABASE_URL}/project/_/sql`);
    console.log(`   2. Copy/paste the SQL from: ${migrationFile}`);
    console.log(`   3. Click "Run"`);
  }
}

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage: node scripts/run-sql-migration.js <migration-file>

Example:
  node scripts/run-sql-migration.js supabase/migrations/006_launch_polls.sql
`);
  process.exit(1);
}

runMigration(args[0]).catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
