#!/usr/bin/env node

/**
 * Clear Production Data - Keep Only Superuser
 * Based on actual database schema
 *
 * Usage:
 *   SUPABASE_URL="https://ysoypphpoacvcluqvscx.supabase.co" \
 *   SUPABASE_SERVICE_KEY="your_key" \
 *   node scripts/clear-production-data-v2.js
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ysoypphpoacvcluqvscx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable not set');
  console.error('\nUsage:');
  console.error('  SUPABASE_SERVICE_KEY="your_key" node scripts/clear-production-data-v2.js');
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
    .select('id, email, first_name, last_name, role, created_at')
    .eq('role', 'super_admin')
    .single();

  if (error) {
    console.error('❌ Error finding superuser:', error.message);
    return null;
  }

  return data;
}

async function getDataCounts() {
  const tables = [
    'supporters',
    'verified_voters',
    'sessions',
    'email_verifications',
    'sms_verifications',
    'poll_votes',
    'poll_choices',
    'polls',
    'comments',
    'comment_votes',
    'idea_votes',
    'idea_support',
    'ideas',
    'questions',
    'endorsements',
    'interest',
    'error_logs',
    'audit_logs',
    'thread_subscriptions',
    'notification_preferences',
    'broadcasts'
  ];

  const counts = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    counts[table] = error ? `error: ${error.message}` : count;
  }

  return counts;
}

async function clearData(superuserId, superuserEmail) {
  console.log('\n🗑️  Clearing data...\n');

  const results = {
    success: [],
    errors: []
  };

  // Helper function to delete with logging
  async function deleteFrom(table, description, filter = null) {
    console.log(`Clearing ${table}...`);
    let query = supabase.from(table).delete();

    // Apply filter if provided
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value.type === 'neq') {
          query = query.neq(key, value.value);
        } else if (value.type === 'not_in') {
          query = query.not(key, 'in', value.value);
        }
      });
    } else {
      // Delete all - need to provide a condition that matches everything
      query = query.neq('id', '00000000-0000-0000-0000-000000000000');
    }

    const { error } = await query;

    if (error) {
      results.errors.push(`${table}: ${error.message}`);
    } else {
      results.success.push(table);
    }
  }

  // Clear in correct order (respecting foreign keys)

  // 1. Thread subscriptions (no dependencies)
  await deleteFrom('thread_subscriptions', 'thread subscriptions');

  // 2. Notification preferences (keep superuser's)
  console.log('Clearing notification_preferences (except superuser)...');
  const { error: notifError } = await supabase
    .from('notification_preferences')
    .delete()
    .neq('email', superuserEmail);
  notifError ? results.errors.push(`notification_preferences: ${notifError.message}`) : results.success.push('notification_preferences');

  // 3. Sessions (keep superuser's)
  console.log('Clearing sessions (except superuser)...');
  const { error: sessError } = await supabase
    .from('sessions')
    .delete()
    .neq('supporter_id', superuserId);
  sessError ? results.errors.push(`sessions: ${sessError.message}`) : results.success.push('sessions');

  // 4. Email/SMS verifications (keep superuser's)
  console.log('Clearing email_verifications (except superuser)...');
  const { error: emailVerifError } = await supabase
    .from('email_verifications')
    .delete()
    .neq('supporter_id', superuserId);
  emailVerifError ? results.errors.push(`email_verifications: ${emailVerifError.message}`) : results.success.push('email_verifications');

  console.log('Clearing sms_verifications (except superuser)...');
  const { error: smsVerifError } = await supabase
    .from('sms_verifications')
    .delete()
    .neq('supporter_id', superuserId);
  smsVerifError ? results.errors.push(`sms_verifications: ${smsVerifError.message}`) : results.success.push('sms_verifications');

  // 5. Comment system (votes first, then comments)
  await deleteFrom('comment_votes', 'comment votes');
  await deleteFrom('comments', 'comments');

  // 6. Poll system (votes only, keep poll structure)
  await deleteFrom('poll_votes', 'poll votes');

  // 7. Ideas system (votes and support only, keep idea structure)
  await deleteFrom('idea_votes', 'idea votes');
  await deleteFrom('idea_support', 'idea support');

  // 8. Public submissions
  await deleteFrom('questions', 'questions');
  await deleteFrom('endorsements', 'endorsements');
  await deleteFrom('interest', 'interest/get-involved');

  // 9. Logging
  await deleteFrom('error_logs', 'error logs');

  // 10. Verified voters (except superuser email)
  console.log('Clearing verified_voters (except superuser)...');
  const { error: verVoterError } = await supabase
    .from('verified_voters')
    .delete()
    .neq('email', superuserEmail);
  verVoterError ? results.errors.push(`verified_voters: ${verVoterError.message}`) : results.success.push('verified_voters');

  // 11. Supporters (except superuser)
  console.log('Clearing supporters (except superuser)...');
  const { error: supporterError } = await supabase
    .from('supporters')
    .delete()
    .neq('role', 'super_admin');
  supporterError ? results.errors.push(`supporters: ${supporterError.message}`) : results.success.push('supporters');

  return results;
}

async function main() {
  console.log('🧹 Production Data Cleanup Tool\n');
  console.log('Database: https://ysoypphpoacvcluqvscx.supabase.co\n');

  // Get superuser
  console.log('🔍 Finding superuser...');
  const superuser = await getSuperuser();

  if (!superuser) {
    console.error('\n❌ Could not find superuser (role = \'super_admin\').');
    console.error('\nTo fix, run this SQL in Supabase:');
    console.error('UPDATE supporters SET role = \'super_admin\' WHERE email = \'your@email.com\';');
    rl.close();
    process.exit(1);
  }

  console.log(`✅ Found superuser: ${superuser.first_name} ${superuser.last_name}`);
  console.log(`   Email: ${superuser.email}`);
  console.log(`   ID: ${superuser.id}`);
  console.log(`   Created: ${new Date(superuser.created_at).toLocaleDateString()}\n`);

  // Get current data counts
  console.log('📊 Current data counts:');
  const beforeCounts = await getDataCounts();
  Object.entries(beforeCounts).forEach(([table, count]) => {
    if (typeof count === 'number' && count > 0) {
      console.log(`   ${table}: ${count}`);
    }
  });

  // Confirm
  console.log('\n⚠️  WARNING: This will DELETE:');
  console.log('   ✓ All poll votes');
  console.log('   ✓ All comments and replies');
  console.log('   ✓ All idea votes and support');
  console.log('   ✓ All error logs');
  console.log('   ✓ All questions and endorsements');
  console.log('   ✓ All interest/get-involved submissions');
  console.log('   ✓ All verified voters (except your email)');
  console.log('   ✓ All supporters (except your super_admin account)');
  console.log('   ✓ All sessions, verifications, subscriptions');
  console.log('\n   KEPT: Polls, Ideas (structure only), Broadcasts, Audit logs');
  console.log(`\n   PRESERVED: ${superuser.email} (super_admin)\n`);

  const answer = await ask('Type "DELETE ALL DATA" to proceed: ');

  if (answer !== 'DELETE ALL DATA') {
    console.log('\n❌ Aborted. No data was deleted.');
    rl.close();
    process.exit(0);
  }

  // Clear data
  const results = await clearData(superuser.id, superuser.email);

  console.log('\n✅ Cleanup complete!\n');
  if (results.success.length > 0) {
    console.log(`   ✓ Cleared ${results.success.length} tables:`);
    results.success.forEach(table => console.log(`     - ${table}`));
  }
  if (results.errors.length > 0) {
    console.log(`\n   ⚠️  ${results.errors.length} errors:`);
    results.errors.forEach(err => console.log(`     ! ${err}`));
  }

  // Show final counts
  console.log('\n📊 Final data counts:');
  const afterCounts = await getDataCounts();
  Object.entries(afterCounts).forEach(([table, count]) => {
    const before = beforeCounts[table];
    if (typeof count === 'number' || typeof before === 'number') {
      console.log(`   ${table}: ${count}${before !== count ? ` (was ${before})` : ''}`);
    }
  });

  // Verify superuser still exists
  console.log('\n🔐 Verifying superuser account...');
  const verifyUser = await getSuperuser();
  if (verifyUser) {
    console.log(`✅ Superuser still exists: ${verifyUser.email}`);
  } else {
    console.error('❌ WARNING: Superuser account not found after cleanup!');
  }

  console.log('\n🎉 Database is clean and ready for production users!');
  console.log('\n   Next steps:');
  console.log('   1. Test admin login: https://www.dougcharles.com/admin/login');
  console.log('   2. Verify you can access admin dashboard');
  console.log('   3. Site is ready for real voters!\n');

  rl.close();
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  console.error(err.stack);
  rl.close();
  process.exit(1);
});
