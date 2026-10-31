import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env';
import { createServiceSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const header = request.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const auth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  let service;
  try {
    service = createServiceSupabase();
  } catch {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, { status: 500 });
  }

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profile?.role !== 'administrator') {
    return NextResponse.json({ error: 'Only administrators can view the team.' }, { status: 403 });
  }

  const [{ data: users }, { data: profiles }] = await Promise.all([
    service.auth.admin.listUsers({ page: 1, perPage: 200 }),
    service.from('profiles').select('id, full_name, role').order('created_at', { ascending: true }),
  ]);
  const byId = new Map((users?.users || []).map((user) => [user.id, user]));

  return NextResponse.json(
    (profiles || []).map((person) => ({
      id: person.id,
      full_name: person.full_name,
      role: person.role,
      email: byId.get(person.id)?.email || '',
    })),
  );
}
