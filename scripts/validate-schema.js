const { createClient } = require('@supabase/supabase-js');

// Use env vars if available, otherwise use defaults for validation
const url = process.env.SUPABASE_URL || 'https://ysoypphpoacvcluqvscx.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!key) {
  console.log('No service role key found in environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function validate() {
  console.log('=== DATABASE SCHEMA VALIDATION ===\n');

  // 1. Check error_logs new columns
  console.log('1. ERROR_LOGS NEW COLUMNS:');
  const { error: errError } = await supabase
    .from('error_logs')
    .select('severity, correlation_id, latency_ms, visitor_session_id')
    .limit(1);
  if (errError) {
    console.log('   ❌ Missing columns:', errError.message);
  } else {
    console.log('   ✅ severity, correlation_id, latency_ms, visitor_session_id - EXIST');
  }

  // 2. Check visitor_sessions table
  console.log('\n2. VISITOR_SESSIONS TABLE:');
  const { error: vsError } = await supabase
    .from('visitor_sessions')
    .select('id, supporter_id, anonymous_token, device_type, utm_source')
    .limit(1);
  if (vsError) {
    console.log('   ❌ Table missing or error:', vsError.message);
  } else {
    console.log('   ✅ visitor_sessions table EXISTS');
  }

  // 3. Check session_activities table
  console.log('\n3. SESSION_ACTIVITIES TABLE:');
  const { error: saError } = await supabase
    .from('session_activities')
    .select('id, visitor_session_id, activity_type, correlation_id, latency_ms')
    .limit(1);
  if (saError) {
    console.log('   ❌ Table missing or error:', saError.message);
  } else {
    console.log('   ✅ session_activities table EXISTS');
  }

  // 4. Check donation_events table
  console.log('\n4. DONATION_EVENTS TABLE:');
  const { error: deError } = await supabase
    .from('donation_events')
    .select('id, visitor_session_id, event_type, selected_amount, is_custom_amount')
    .limit(1);
  if (deError) {
    console.log('   ❌ Table missing or error:', deError.message);
  } else {
    console.log('   ✅ donation_events table EXISTS');
  }

  // 5. Check audit_logs new columns
  console.log('\n5. AUDIT_LOGS NEW COLUMNS:');
  const { error: auditError } = await supabase
    .from('audit_logs')
    .select('visitor_session_id, correlation_id')
    .limit(1);
  if (auditError) {
    console.log('   ❌ Missing columns:', auditError.message);
  } else {
    console.log('   ✅ visitor_session_id, correlation_id - EXIST');
  }

  // 6. Check cleanup functions
  console.log('\n6. CLEANUP FUNCTIONS:');
  const { data: funcData, error: funcError } = await supabase.rpc('run_data_retention_cleanup');
  if (funcError) {
    console.log('   ❌ run_data_retention_cleanup:', funcError.message);
  } else {
    console.log('   ✅ run_data_retention_cleanup EXISTS');
    console.log('   Result:', JSON.stringify(funcData));
  }

  // 7. Check increment_session_stats function
  console.log('\n7. INCREMENT_SESSION_STATS FUNCTION:');
  const { error: incTestError } = await supabase.rpc('increment_session_stats', {
    p_session_id: '00000000-0000-0000-0000-000000000000',
    p_is_page_view: false
  });
  if (incTestError && incTestError.message.includes('does not exist')) {
    console.log('   ❌ increment_session_stats missing');
  } else {
    console.log('   ✅ increment_session_stats EXISTS');
  }

  console.log('\n=== VALIDATION COMPLETE ===');
}

validate().catch(console.error);
