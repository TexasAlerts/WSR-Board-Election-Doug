#!/usr/bin/env node

/**
 * Create Launch Polls
 * Uses the admin API to create the 5 initial campaign polls
 *
 * Usage: ADMIN_PASSWORD=your-password node scripts/create-polls.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      process.env[key.trim()] = value.trim();
    }
  });
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('❌ Error: ADMIN_PASSWORD not set');
  console.log('Usage: ADMIN_PASSWORD=your-password node scripts/create-polls.js');
  process.exit(1);
}

const polls = [
  {
    title: 'Which issues are MOST important to you when it comes to Prosper\'s Town Government?',
    description: 'Select your top 5 priorities (you can select up to 5 options)',
    poll_type: 'multiple_choice',
    visibility: 'public',
    status: 'active',
    allow_comments: true,
    show_results_before_vote: false,
    choices: [
      { choice_text: 'Traffic congestion and road conditions', display_order: 0 },
      { choice_text: 'Property tax burden', display_order: 1 },
      { choice_text: 'Controlling apartment/multifamily development', display_order: 2 },
      { choice_text: 'Preserving Prosper\'s small-town character', display_order: 3 },
      { choice_text: 'Public safety (police/fire services)', display_order: 4 },
      { choice_text: 'Water/utility costs', display_order: 5 },
      { choice_text: 'Parks and recreation facilities', display_order: 6 },
      { choice_text: 'Library services', display_order: 7 },
      { choice_text: 'Retail and restaurant options', display_order: 8 },
      { choice_text: 'Downtown/Old Town development', display_order: 9 },
      { choice_text: 'School overcrowding impacts', display_order: 10 },
      { choice_text: 'Flooding/drainage issues', display_order: 11 },
    ]
  },
  {
    title: 'If you could address only ONE issue facing Prosper, what would it be?',
    poll_type: 'single_choice',
    visibility: 'public',
    status: 'active',
    allow_comments: true,
    show_results_before_vote: false,
    choices: [
      { choice_text: 'Fix traffic congestion and improve roads', display_order: 0 },
      { choice_text: 'Lower property taxes', display_order: 1 },
      { choice_text: 'Stop excessive apartment development', display_order: 2 },
      { choice_text: 'Maintain our small-town feel', display_order: 3 },
      { choice_text: 'Improve public safety response times', display_order: 4 },
      { choice_text: 'Control water/utility rate increases', display_order: 5 },
      { choice_text: 'Build better parks and recreation facilities', display_order: 6 },
      { choice_text: 'Expand library services', display_order: 7 },
      { choice_text: 'Attract more restaurants and shopping', display_order: 8 },
      { choice_text: 'Revitalize Downtown Prosper', display_order: 9 },
      { choice_text: 'Other', display_order: 10 },
    ]
  },
  {
    title: 'Do you think Prosper is growing...',
    poll_type: 'single_choice',
    visibility: 'public',
    status: 'active',
    allow_comments: true,
    show_results_before_vote: false,
    choices: [
      { choice_text: 'Too fast - we need to slow down development', display_order: 0 },
      { choice_text: 'At about the right pace', display_order: 1 },
      { choice_text: 'Too slow - we should encourage more growth', display_order: 2 },
      { choice_text: 'Unsure / No opinion', display_order: 3 },
    ]
  },
  {
    title: 'How important is it to you that Prosper maintains its "small-town character"?',
    poll_type: 'single_choice',
    visibility: 'public',
    status: 'active',
    allow_comments: true,
    show_results_before_vote: false,
    choices: [
      { choice_text: 'Extremely important - it\'s why I moved here', display_order: 0 },
      { choice_text: 'Very important', display_order: 1 },
      { choice_text: 'Somewhat important', display_order: 2 },
      { choice_text: 'Not very important', display_order: 3 },
      { choice_text: 'Not important at all - growth is inevitable', display_order: 4 },
    ]
  },
  {
    title: 'Prosper\'s median property tax bill is over $12,000 annually. How concerned are you about property taxes?',
    poll_type: 'single_choice',
    visibility: 'public',
    status: 'active',
    allow_comments: true,
    show_results_before_vote: false,
    choices: [
      { choice_text: 'Extremely concerned - it\'s affecting my ability to stay in Prosper', display_order: 0 },
      { choice_text: 'Very concerned', display_order: 1 },
      { choice_text: 'Somewhat concerned', display_order: 2 },
      { choice_text: 'Not very concerned', display_order: 3 },
      { choice_text: 'Not concerned at all', display_order: 4 },
    ]
  }
];

async function createPolls() {
  console.log('🗳️  Creating 5 Launch Polls');
  console.log('─'.repeat(60));

  // First, login as admin
  console.log('1. Logging in as admin...');

  const loginRes = await fetch(`${SITE_URL}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    console.error('❌ Admin login failed');
    const error = await loginRes.text();
    console.error(error);
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const adminToken = loginRes.headers.get('set-cookie')?.match(/admin_session=([^;]+)/)?.[1];

  if (!adminToken) {
    console.error('❌ Failed to get admin session token');
    process.exit(1);
  }

  console.log('✅ Admin authenticated');

  // Create each poll
  let created = 0;
  for (let i = 0; i < polls.length; i++) {
    const poll = polls[i];
    console.log(`\n${i + 2}. Creating poll ${i + 1}/5: "${poll.title.substring(0, 50)}..."`);

    const res = await fetch(`${SITE_URL}/api/admin/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `admin_session=${adminToken}`,
      },
      body: JSON.stringify(poll),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`   ❌ Failed: ${error}`);
      continue;
    }

    const result = await res.json();
    console.log(`   ✅ Created (ID: ${result.data.id})`);
    created++;
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`🎉 Successfully created ${created}/${polls.length} polls!`);
  console.log(`\nView at: ${SITE_URL}/polls`);
  console.log(`Admin dashboard: ${SITE_URL}/admin/polls`);
}

createPolls().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
