import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from './env';

export function createServerSupabase() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component. Middleware refreshes the session.
        }
      },
    },
  });
}

export function createServiceSupabase() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
