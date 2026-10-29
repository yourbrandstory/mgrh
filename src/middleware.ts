import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

function withCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isApi = path.startsWith('/api/admin');

  async function profileFor(id: string) {
    const { data } = await supabase.from('profiles').select('id, role').eq('id', id).maybeSingle();
    return data;
  }

  if (path === '/admin/login') {
    if (!user) return response;
    const profile = await profileFor(user.id);
    if (profile) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      url.search = '';
      return withCookies(response, NextResponse.redirect(url));
    }
    await supabase.auth.signOut();
    return response;
  }

  if (!user) {
    if (isApi) {
      return withCookies(
        response,
        NextResponse.json({ error: 'Not signed in.' }, { status: 401 }),
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return withCookies(response, NextResponse.redirect(url));
  }

  const profile = await profileFor(user.id);

  if (!profile) {
    await supabase.auth.signOut();
    if (isApi) {
      return withCookies(
        response,
        NextResponse.json({ error: 'No staff profile for this account.' }, { status: 403 }),
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '?error=no-profile';
    return withCookies(response, NextResponse.redirect(url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
