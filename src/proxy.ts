import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import fs from 'fs/promises';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

function withCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

const DC_REDIRECTS: Record<string, string> = {
  '/1. Home.dc.html': '/',
  '/Home page V2.dc.html': '/',
  '/Home page V3.dc.html': '/',
  '/2. About us.dc.html': '/about',
  '/About us page V2.dc.html': '/about',
  '/3. Facilities.dc.html': '/facilities',
  '/Facilities (V1).dc.html': '/facilities',
  '/Facilities (V1) update version.dc.html': '/facilities',
  '/4. Doctors.dc.html': '/doctors',
  '/Doctors page.dc.html': '/doctors',
  '/Doctors page updated version.dc.html': '/doctors',
  '/5. Programmes.dc.html': '/programmes',
  '/Programmes page.dc.html': '/programmes',
  '/Programmes page updated version.dc.html': '/programmes',
  '/6. Event.dc.html': '/events',
  '/Event page.dc.html': '/events',
  '/Event page updated version.dc.html': '/events',
  '/7. Support.dc.html': '/support',
  '/Support us page.dc.html': '/support',
  '/Support us page updated version.dc.html': '/support',
  '/8. Contact us.dc.html': '/contact',
  '/Contact us page.dc.html': '/contact',
  '/Contact us page updated version.dc.html': '/contact',
  '/9. Emergency.dc.html': '/emergency',
  '/Emergency page.dc.html': '/emergency',
  '/Emergency page updated version.dc.html': '/emergency',
};

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Old design-file links (paths ending in .dc.html) bypass Next's redirect
  // middleware because they look like static assets, so handle them here.
  if (path.endsWith('.dc.html')) {
    const target = DC_REDIRECTS[path];
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      url.search = '';
      return NextResponse.redirect(url, 308);
    }
    // Fallback: keyword match unknown *.dc.html links to a clean page.
    const p = decodeURIComponent(path).toLowerCase();
    const map: [string, string][] = [
      ['emergency', '/emergency'],
      ['contact', '/contact'],
      ['support', '/support'],
      ['event', '/events'],
      ['programme', '/programmes'],
      ['doctor', '/doctors'],
      ['facilit', '/facilities'],
      ['about', '/about'],
      ['home', '/'],
    ];
    const hit = map.find(([k]) => p.includes(k));
    const url = request.nextUrl.clone();
    url.pathname = hit ? hit[1] : '/';
    url.search = '';
    return NextResponse.redirect(url, 308);
  }

  // /_ref/:path* serves reference files (reference/site/...) in dev only.
  // In production it is not exposed: redirect to home.
  if (path.startsWith('/_ref/')) {
    if (process.env.NODE_ENV === 'production') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      return NextResponse.redirect(url, 308);
    }
    const ref = path.slice('/_ref/'.length);
    try {
      const file = await fs.readFile(join(process.cwd(), 'reference', ref), 'utf8');
      return new NextResponse(file, {
        headers: { 'content-type': 'text/html' },
      });
    } catch {
      return new NextResponse('Reference file not found', { status: 404 });
    }
  }

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
  matcher: ['/admin/:path*', '/api/admin/:path*', '/_ref/:path*', '/:path*.dc.html'],
};
