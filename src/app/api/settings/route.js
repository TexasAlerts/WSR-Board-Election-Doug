import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (error) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    const settings = {};
    for (const row of data || []) {
      settings[row.setting_key] = row.setting_value;
    }

    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
