import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import { join } from 'path';

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

  return NextResponse.next();
}

export const config = {
  matcher: ['/_ref/:path*', '/:path*.dc.html'],
};
