import { NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Not signed in.' }, { status: 401 }) };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'administrator') {
    return { error: NextResponse.json({ error: 'Only administrators can manage the team.' }, { status: 403 }) };
  }
  return { user };
}

export async function GET() {
  const check = await requireAdmin();
  if (check.error) return check.error;

  let service;
  try {
    service = createServiceSupabase();
  } catch {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, { status: 500 });
  }

  const [{ data: users }, { data: profiles }] = await Promise.all([
    service.auth.admin.listUsers({ page: 1, perPage: 200 }),
    service.from('profiles').select('*').order('created_at', { ascending: true }),
  ]);
  const byId = new Map((users?.users || []).map((u) => [u.id, u]));
  return NextResponse.json({
    team: (profiles || []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      email: byId.get(p.id)?.email || '',
    })),
  });
}

export async function DELETE(request: Request) {
  const check = await requireAdmin();
  if (check.error) return check.error;

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) return NextResponse.json({ error: 'Missing account id.' }, { status: 400 });
  if (body.id === check.user!.id) {
    return NextResponse.json({ error: 'You cannot remove your own account.' }, { status: 400 });
  }

  let service;
  try {
    service = createServiceSupabase();
  } catch {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, { status: 500 });
  }

  const { data: profile } = await service.from('profiles').select('full_name').eq('id', body.id).maybeSingle();
  const { error } = await service.auth.admin.deleteUser(body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await service.from('activity_log').insert({
    actor: check.user!.id,
    actor_name: '',
    action: 'Removed user',
    entity_type: 'Team',
    entity_title: profile?.full_name || body.id,
  });

  return NextResponse.json({ ok: true });
}
