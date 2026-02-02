import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const eventType = searchParams.get('event_type');
  const supporterId = searchParams.get('supporter_id');
  const targetType = searchParams.get('target_type');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('audit_logs')
    .select(`
      id,
      supporter_id,
      event_type,
      target_id,
      target_type,
      old_values,
      new_values,
      details,
      ip_address,
      user_agent,
      request_method,
      request_path,
      response_status,
      created_at
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventType && eventType !== 'all') {
    query = query.eq('event_type', eventType);
  }
  if (supporterId) {
    query = query.eq('supporter_id', supporterId);
  }
  if (targetType && targetType !== 'all') {
    query = query.eq('target_type', targetType);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }

  // Get supporter names for the logs
  const supporterIds = [...new Set(data.filter(l => l.supporter_id).map(l => l.supporter_id))];
  let supporterNames = {};

  if (supporterIds.length > 0) {
    const { data: supporters } = await supabase
      .from('supporters')
      .select('id, first_name, last_name, email')
      .in('id', supporterIds);

    if (supporters) {
      supporters.forEach(s => {
        supporterNames[s.id] = {
          name: `${s.first_name} ${s.last_name}`,
          email: s.email,
        };
      });
    }
  }

  const logsWithNames = data.map(l => ({
    ...l,
    supporter_name: l.supporter_id ? supporterNames[l.supporter_id]?.name : null,
    supporter_email: l.supporter_id ? supporterNames[l.supporter_id]?.email : null,
  }));

  return NextResponse.json({ ok: true, data: logsWithNames });
}
