#!/usr/bin/env node

/**
 * Execute SQL Migration via Direct Supabase Client
 * Uses Supabase client to insert polls and choices
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ysoypphpoacvcluqvscx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzb3lwcGhwb2FjdmNsdXF2c2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDc1NzU1NiwiZXhwIjoyMDcwMzMzNTU2fQ.BlhUq20jpNbNGdcRzEcqxFwE5I53jAJiQokdie1yEfE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const polls = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Which issues are MOST important to you when it comes to Prosper\'s Town Government?',
    description: 'Select your top 5 priorities (you can select up to 5 options)',
    poll_type: 'multiple_choice',
    status: 'active',
    visibility: 'public',
    show_results_before_vote: false,
    allow_comments: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
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
    id: 'a0000000-0000-0000-0000-000000000002',
    title: 'If you could address only ONE issue facing Prosper, what would it be?',
    description: null,
    poll_type: 'single_choice',
    status: 'active',
    visibility: 'public',
    show_results_before_vote: false,
    allow_comments: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    choices: [
      { choice_text: 'Fix traffic congestion and improve roads', display_order: 0, is_other_option: false },
      { choice_text: 'Lower property taxes', display_order: 1, is_other_option: false },
      { choice_text: 'Stop excessive apartment development', display_order: 2, is_other_option: false },
      { choice_text: 'Maintain our small-town feel', display_order: 3, is_other_option: false },
      { choice_text: 'Improve public safety response times', display_order: 4, is_other_option: false },
      { choice_text: 'Control water/utility rate increases', display_order: 5, is_other_option: false },
      { choice_text: 'Build better parks and recreation facilities', display_order: 6, is_other_option: false },
      { choice_text: 'Expand library services', display_order: 7, is_other_option: false },
      { choice_text: 'Attract more restaurants and shopping', display_order: 8, is_other_option: false },
      { choice_text: 'Revitalize Downtown Prosper', display_order: 9, is_other_option: false },
      { choice_text: 'Other', display_order: 10, is_other_option: true },
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    title: 'Do you think Prosper is growing...',
    description: null,
    poll_type: 'single_choice',
    status: 'active',
    visibility: 'public',
    show_results_before_vote: false,
    allow_comments: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    choices: [
      { choice_text: 'Too fast - we need to slow down development', display_order: 0 },
      { choice_text: 'At about the right pace', display_order: 1 },
      { choice_text: 'Too slow - we should encourage more growth', display_order: 2 },
      { choice_text: 'Unsure / No opinion', display_order: 3 },
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    title: 'How important is it to you that Prosper maintains its "small-town character"?',
    description: null,
    poll_type: 'single_choice',
    status: 'active',
    visibility: 'public',
    show_results_before_vote: false,
    allow_comments: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    choices: [
      { choice_text: 'Extremely important - it\'s why I moved here', display_order: 0 },
      { choice_text: 'Very important', display_order: 1 },
      { choice_text: 'Somewhat important', display_order: 2 },
      { choice_text: 'Not very important', display_order: 3 },
      { choice_text: 'Not important at all - growth is inevitable', display_order: 4 },
    ]
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    title: 'Prosper\'s median property tax bill is over $12,000 annually. How concerned are you about property taxes?',
    description: null,
    poll_type: 'single_choice',
    status: 'active',
    visibility: 'public',
    show_results_before_vote: false,
    allow_comments: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
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
  console.log('🗳️  Creating 5 Launch Polls via Supabase Client');
  console.log('─'.repeat(60));

  let created = 0;
  let errors = [];

  for (let i = 0; i < polls.length; i++) {
    const poll = polls[i];
    const pollNum = i + 1;
    const choices = poll.choices;
    delete poll.choices;

    console.log(`\n${pollNum}. Creating poll: "${poll.title.substring(0, 50)}..."`);

    // Insert poll
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert(poll)
      .select()
      .single();

    if (pollError) {
      console.error(`   ❌ Poll failed: ${pollError.message}`);
      errors.push({ poll: pollNum, error: pollError.message });
      continue;
    }

    console.log(`   ✅ Poll created (ID: ${pollData.id})`);

    // Insert choices
    const choicesWithPollId = choices.map(choice => ({
      ...choice,
      poll_id: pollData.id
    }));

    const { error: choicesError } = await supabase
      .from('poll_choices')
      .insert(choicesWithPollId);

    if (choicesError) {
      console.error(`   ❌ Choices failed: ${choicesError.message}`);
      errors.push({ poll: pollNum, error: choicesError.message });
      // Rollback poll creation
      await supabase.from('polls').delete().eq('id', pollData.id);
      console.log(`   🔄 Rolled back poll creation`);
      continue;
    }

    console.log(`   ✅ ${choices.length} choices created`);
    created++;
  }

  console.log('\n' + '─'.repeat(60));
  if (created === polls.length) {
    console.log(`🎉 SUCCESS! All ${created} polls created!`);
    console.log(`\n📊 View at: https://www.dougcharles.com/polls`);
    console.log(`🔧 Admin: https://www.dougcharles.com/admin/polls`);
  } else {
    console.log(`⚠️  Created ${created}/${polls.length} polls`);
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(e => console.log(`  Poll ${e.poll}: ${e.error}`));
    }
  }
}

createPolls().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  console.error(err);
  process.exit(1);
});
