#!/usr/bin/env node

/**
 * Clear Production Data - Keep Only Superuser
 *
 * This script clears all user-generated data while preserving your superuser account.
 *
 * Usage:
 *   node scripts/clear-production-data.js
 *
 * Environment variables required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY (from .env.local or Vercel)
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ysoypphpoacvcluqvscx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable not set');
  console.error('Set it with: export SUPABASE_SERVICE_KEY=your_key_here');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function getSuperuser() {
  const { data, error } = await supabase
    .from('supporters')
    .select('id, email, first_name, last_name, role')
    .eq('role', 'super_admin')
    .single();

  if (error) {
    console.error('❌ Error finding superuser:', error);
    return null;
  }

  return data;
}

async function getDataCounts() {
  const tables = [
    'supporters',
    'verified_voters',
    'poll_votes',
    'comments',
    'comment_votes',
    'idea_votes',
    'idea_support',
    'error_logs',
    'audit_logs',
    'questions',
    'endorsements',
    'polls',
    'ideas'
  ];

  const counts = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    counts[table] = error ? 'error' : count;
  }

  return counts;
}

async function clearData(superuserEmail) {
  console.log('\n🗑️  Clearing data...\n');

  const results = {
    success: [],
    errors: []
  };

  // Clear poll votes
  console.log('Clearing poll_votes...');
  let { error } = await supabase.from('poll_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) results.errors.push(`poll_votes: ${error.message}`);
  else results.success.push('poll_votes');

  // Clear comment votes
  console.log('Clearing comment_votes...');
  ({ error } = await supabase.from('comment_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  if (error) results.errors.push(`comment_votes: ${error.message}`);
  else results.success.push('comment_votes');

  // Clear comments
  console.log('Clearing comments...');
  ({ error } = await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  if (error) results.errors.push(`comments: ${error.message}`);
  else results.success.push('comments');

  // Clear idea votes
  console.log('Clearing idea_votes...');
  ({ error } = await supabase.from('idea_votes').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  if (error) results.errors.push(`idea_votes: ${error.message}`);
  else results.success.push('idea_votes');

  // Clear idea support
  console.log('Clearing idea_support...');
  ({ error } = await supabase.from('idea_support').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  if (error) results.errors.push(`idea_support: ${error.message}`);
  else results.success.push('idea_support');

  // Clear error logs
  console.log('Clearing error_logs...');
  ({ error } = await supabase.from('error_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  if (error) results.errors.push(`error_logs: ${error.message}`);
  else results.success.push('error_logs');

  // Clear questions
  console.log('Clearing questions...');
  ({ error } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  if (error) results.errors.push(`questions: ${error.message}`);
  else results.success.push('questions');

  // Clear endorsements
  console.log('Clearing endorsements...');
  ({ error } = await supabase.from('endorsements').delete().neq('id', '00000000-0000-0000-0000-000000000000'));
  if (error) results.errors.push(`endorsements: ${error.message}`);
  else results.success.push('endorsements');

  // Clear verified voters (except superuser)
  console.log('Clearing verified_voters (except superuser)...');
  ({ error } = await supabase.from('verified_voters').delete().neq('email', superuserEmail));
  if (error) results.errors.push(`verified_voters: ${error.message}`);
  else results.success.push('verified_voters');

  // Clear supporters (except superuser)
  console.log('Clearing supporters (except superuser)...');
  ({ error } = await supabase.from('supporters').delete().neq('role', 'super_admin'));
  if (error) results.errors.push(`supporters: ${error.message}`);
  else results.success.push('supporters');

  return results;
}

async function main() {
  console.log('🧹 Production Data Cleanup Tool\n');
  console.log('This will DELETE all user-generated data except your superuser account.\n');

  // Get superuser
  console.log('🔍 Finding superuser...');
  const superuser = await getSuperuser();

  if (!superuser) {
    console.error('❌ Could not find superuser. Aborting.');
    rl.close();
    process.exit(1);
  }

  console.log(`✅ Found superuser: ${superuser.first_name} ${superuser.last_name} (${superuser.email})\n`);

  // Get current data counts
  console.log('📊 Current data counts:');
  const beforeCounts = await getDataCounts();
  Object.entries(beforeCounts).forEach(([table, count]) => {
    console.log(`   ${table}: ${count}`);
  });

  // Confirm
  console.log('\n⚠️  WARNING: This will delete:');
  console.log('   - All poll votes');
  console.log('   - All comments and replies');
  console.log('   - All idea votes and support');
  console.log('   - All error logs');
  console.log('   - All questions');
  console.log('   - All endorsements');
  console.log('   - All verified voters (except your superuser email)');
  console.log('   - All supporters (except your superuser account)');
  console.log('\n   Polls and Ideas will be KEPT (only their votes/comments deleted)');
  console.log(`\n   PRESERVED: ${superuser.email} (superuser)\n`);

  const answer = await ask('Type "DELETE ALL DATA" to proceed: ');

  if (answer !== 'DELETE ALL DATA') {
    console.log('\n❌ Aborted. No data was deleted.');
    rl.close();
    process.exit(0);
  }

  // Clear data
  const results = await clearData(superuser.email);

  console.log('\n✅ Cleanup complete!\n');
  console.log(`   Cleared: ${results.success.join(', ')}`);
  if (results.errors.length > 0) {
    console.log(`   ⚠️  Errors: ${results.errors.join(', ')}`);
  }

  // Show final counts
  console.log('\n📊 Final data counts:');
  const afterCounts = await getDataCounts();
  Object.entries(afterCounts).forEach(([table, count]) => {
    console.log(`   ${table}: ${count}`);
  });

  console.log('\n🎉 Database is now clean and ready for fresh data!');

  rl.close();
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  rl.close();
  process.exit(1);
});
