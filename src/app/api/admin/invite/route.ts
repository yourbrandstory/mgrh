import { NextResponse } from 'next/server';
import { createServerSupabase, createServiceSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'administrator') {
    return NextResponse.json({ error: 'Only administrators can invite staff.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    fullName?: string;
    role?: string;
  };
  const email = (body.email || '').trim().toLowerCase();
  const fullName = (body.fullName || '').trim();
  const role = body.role === 'administrator' ? 'administrator' : 'editor';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!fullName) {
    return NextResponse.json({ error: 'Enter the person’s full name.' }, { status: 400 });
  }

  let service;
  try {
    service = createServiceSupabase();
  } catch {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' }, { status: 500 });
  }

  const { data: invited, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  });
  if (inviteError || !invited.user) {
    return NextResponse.json({ error: inviteError?.message || 'The invitation could not be sent.' }, { status: 400 });
  }

  const { error: profileError } = await service.from('profiles').upsert({
    id: invited.user.id,
    full_name: fullName,
    role,
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  await service.from('activity_log').insert({
    actor: user.id,
    actor_name: (await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()).data?.full_name || '',
    action: 'Invited user',
    entity_type: 'Team',
    entity_title: `${fullName} (${email})`,
  });

  return NextResponse.json({
    message: `Invitation sent to ${email}. They will choose their own password.`,
  });
}
