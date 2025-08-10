import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const type = String(body.type || 'updates');
    const name = String(body.name || '').slice(0, 200);
    const email = String(body.email || '').slice(0, 200);
    const phone = body.phone ? String(body.phone).slice(0, 200) : null;
    const message = body.message ? String(body.message).slice(0, 4000) : null;
    const { error } = await supabase
      .from('interest')
      .insert({ type, name, email, phone, message });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}