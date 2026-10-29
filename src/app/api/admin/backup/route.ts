import { NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'administrator') {
    return NextResponse.json({ error: 'Only administrators can download a backup.' }, { status: 403 });
  }

  let service;
  try {
    service = createServiceSupabase();
  } catch {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, { status: 500 });
  }

  const tables = ['settings', 'categories', 'media', 'doctors', 'facilities', 'facility_images', 'events', 'event_images'];
  const entries = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await service.from(table).select('*');
      return [table, error ? [] : data || []] as const;
    }),
  );

  const payload = {
    version: 1,
    exported_at: new Date().toISOString(),
    tables: Object.fromEntries(entries),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="mgrh-content-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
