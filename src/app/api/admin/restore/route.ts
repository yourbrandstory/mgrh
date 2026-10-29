import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'administrator') {
    return NextResponse.json({ error: 'Only administrators can restore a backup.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { version?: number; tables?: Record<string, unknown[]> }
    | null;
  if (!body || body.version !== 1 || !body.tables) {
    return NextResponse.json({ error: 'That file is not an MGRH Content Manager backup.' }, { status: 400 });
  }

  let service;
  try {
    service = createServiceSupabase();
  } catch {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, { status: 500 });
  }

  const order = ['settings', 'categories', 'media', 'doctors', 'facilities', 'facility_images', 'events', 'event_images'];
  for (const table of order) {
    const rows = body.tables[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const { error } = await service.from(table).upsert(rows, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: `${table}: ${error.message}` }, { status: 400 });
  }

  await service.from('activity_log').insert({
    actor: user.id,
    actor_name: profile?.role === 'administrator' ? 'Administrator' : '',
    action: 'Restored backup',
    entity_type: 'Settings',
    entity_title: body.tables ? 'Content backup' : '',
  });

  for (const path of ['/', '/doctors', '/facilities', '/events', '/programmes']) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true });
}
