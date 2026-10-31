import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env';
import { createServiceSupabase } from '@/lib/supabase/server';

async function requireAdmin(request: Request) {
  const header = request.headers.get('authorization') || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { error: NextResponse.json({ error: 'Not signed in.' }, { status: 401 }) };
  }

  const auth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) {
    return { error: NextResponse.json({ error: 'Not signed in.' }, { status: 401 }) };
  }

  let service;
  try {
    service = createServiceSupabase();
  } catch {
    return { error: NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' }, { status: 500 }) };
  }

  const { data: profile } = await service
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (profile?.role !== 'administrator') {
    return { error: NextResponse.json({ error: 'Only administrators can manage the team.' }, { status: 403 }) };
  }

  return { user: authData.user, service };
}

export async function POST(request: Request) {
  const check = await requireAdmin(request);
  if ('error' in check) return check.error;

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    role?: string;
    password?: string;
  };
  const email = (body.email || '').trim().toLowerCase();
  const name = (body.name || '').trim();
  const password = body.password || '';
  const role = body.role === 'Administrator' || body.role === 'administrator' ? 'administrator' : 'editor';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Enter the person\'s full name.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Use a password of at least 8 characters.' }, { status: 400 });
  }

  const service = check.service;
  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message || 'The account could not be created.' }, { status: 400 });
  }

  const { error: profileError } = await service.from('profiles').upsert({
    id: created.user.id,
    full_name: name,
    role,
  });
  if (profileError) {
    await service.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ id: created.user.id, email });
}

export async function DELETE(request: Request) {
  const check = await requireAdmin(request);
  if ('error' in check) return check.error;

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: 'Missing account id.' }, { status: 400 });
  }
  if (body.id === check.user!.id) {
    return NextResponse.json({ error: 'You cannot remove your own account.' }, { status: 400 });
  }

  const { error } = await check.service.auth.admin.deleteUser(body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

