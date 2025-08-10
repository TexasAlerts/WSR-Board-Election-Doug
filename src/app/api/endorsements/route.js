import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use anon key for public endpoints; this allows RLS to restrict selecting only approved
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET() {
  const { data, error } = await supabase
    .from('endorsements')
    .select('*')
    .eq('status', 'approved')
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
    const message = String(body.message || '').slice(0, 4000);
    const { error } = await supabase
      .from('endorsements')
      .insert({ name, message, status: 'pending' });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}