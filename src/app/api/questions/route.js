import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET() {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('status', 'approved')
    .not('answer', 'is', null)
    .neq('answer', '')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || '').slice(0, 200);
    const email = String(body.email || '').slice(0, 200);
    const question = String(body.question || '').slice(0, 4000);
    const { error } = await supabase
      .from('questions')
      .insert({ name, email, question, status: 'pending' });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}