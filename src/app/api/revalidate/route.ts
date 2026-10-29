import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { REVALIDATE_SECRET } from '@/lib/supabase/env';

export async function POST(request: Request) {
  let allowed = false;

  const header = request.headers.get('x-revalidate-secret');
  if (REVALIDATE_SECRET && header === REVALIDATE_SECRET) allowed = true;

  if (!allowed) {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
      allowed = Boolean(profile);
    }
  }

  if (!allowed) return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });

  for (const path of ['/', '/doctors', '/facilities', '/events', '/programmes']) {
    revalidatePath(path);
  }
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}
