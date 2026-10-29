'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from './AdminProvider';
import { AdminIcon } from './icons';
import { createClient } from '@/lib/supabase/client';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', hint: 'Start here', icon: 'dashboard' },
  { href: '/admin/doctors', label: 'Doctors', hint: 'Names, timings, photos', icon: 'doctors' },
  { href: '/admin/facilities', label: 'Facilities', hint: 'Departments and services', icon: 'facilities' },
  { href: '/admin/events', label: 'Events', hint: 'Camps and drives', icon: 'events' },
  { href: '/admin/media', label: 'Media Library', hint: 'All uploaded photos', icon: 'image' },
  { href: '/admin/settings', label: 'Settings', hint: 'Account, team, backups', icon: 'settings' },
];

const TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/doctors': 'Doctors',
  '/admin/facilities': 'Facilities',
  '/admin/events': 'Events',
  '/admin/media': 'Media Library',
  '/admin/team': 'Team & permissions',
  '/admin/settings': 'Settings',
  '/admin/activity': 'Activity',
};

const SINGULAR: Record<string, string> = {
  doctors: 'doctor',
  facilities: 'facility',
  events: 'event',
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  const match = pathname.match(/^\/admin\/(doctors|facilities|events)\/([^/]+)$/);
  if (match) return `${match[2] === 'new' ? 'Add' : 'Edit'} ${SINGULAR[match[1]]}`;
  return 'Website editor';
}

function Shell({ children }: { children: React.ReactNode }) {
  const { loading, profile, doctors, facilities, events } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState('');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const out: { title: string; type: string; href: string; status: string }[] = [];
    doctors.forEach((d) => {
      if (String(d.name).toLowerCase().includes(q)) out.push({ title: d.name, type: 'Doctor', href: `/admin/doctors?edit=${d.id}`, status: d.status });
    });
    facilities.forEach((f) => {
      if (String(f.name).toLowerCase().includes(q)) out.push({ title: f.name, type: 'Facility', href: `/admin/facilities?edit=${f.id}`, status: f.status });
    });
    events.forEach((e) => {
      if (String(e.title).toLowerCase().includes(q)) out.push({ title: e.title, type: 'Event', href: `/admin/events?edit=${e.id}`, status: e.status });
    });
    return out.slice(0, 8);
  }, [doctors, events, facilities, query]);

  async function logout() {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.replace('/admin/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="admin-spin h-9 w-9 rounded-full border-[3px] border-[#BFE3DB] border-t-[#0A8E7B]" />
          <div className="text-[15px] font-medium text-[#45605A]">Loading the website editor…</div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initials = (profile.full_name || 'Staff')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const title = titleFor(pathname || '');

  const sidebar = (
    <>
      <div className="flex items-center gap-3 px-[22px] pb-5 pt-[22px]">
        <div className="rounded-[10px] bg-white px-[9px] py-1.5">
          <img src="/images/logo.png" alt="MGRH" className="block h-10 w-auto" />
        </div>
        <div className="text-[15px] font-semibold leading-[1.3] text-white">
          Website<br />
          <span className="font-medium text-[#9FD8CE]">editor</span>
        </div>
      </div>
      <nav className="admin-scroll flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-1.5">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`nav-link flex items-start gap-[13px] rounded-[10px] px-[14px] py-3 transition-colors ${
                active ? 'bg-white/[0.12]' : 'hover:bg-white/[0.09]'
              }`}
            >
              <span
                className={`flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] transition-[background-color,transform] duration-300 ${
                  active ? 'scale-[1.08] bg-[#0A8E7B]' : 'bg-white/10'
                }`}
              >
                <AdminIcon name={n.icon} size={18} color="#fff" />
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold text-white">{n.label}</span>
                <span className="mt-[2px] block text-[13px] leading-[1.35] text-[#A9D5CD]">{n.hint}</span>
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl bg-white/[0.07] p-3.5">
        <div className="mb-3 flex items-center gap-[11px]">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#0A8E7B] text-[14px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold text-white">{profile.full_name || 'Staff'}</div>
            <div className="text-[13px] capitalize text-[#A9D5CD]">{profile.role}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          disabled={signingOut}
          className="flex h-[38px] w-full items-center justify-center gap-2 rounded-lg border border-white/[0.28] text-[14.5px] font-semibold text-white hover:bg-white/10"
        >
          <AdminIcon name="logout" size={15} color="#fff" /> {signingOut ? 'Signing out…' : 'Log out'}
        </button>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-[#0B3C49] text-white lg:flex">{sidebar}</aside>

      {drawer && (
        <div className="fixed inset-0 z-[120] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-[288px] animate-[cmsUp_0.2s_ease] flex-col bg-[#0B3C49] text-white">{sidebar}</aside>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[#E2ECE9] bg-white/[0.97]">
          <div className="flex items-center gap-4 px-4 py-[14px] md:gap-6 md:px-8">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-[#D5E2DE] text-[#0B3C49] lg:hidden"
              aria-label="Open menu"
            >
              <AdminIcon name="menu" />
            </button>
            <div className="min-w-[140px] flex-[1_0_140px]">
              <div className="mb-[3px] flex min-h-[18px] items-center gap-2 text-[14px] text-[#7A8C87]">
                {pathname !== '/admin/dashboard' && (
                  <>
                    <Link href="/admin/dashboard" className="crumb-link text-[14px]">Dashboard</Link>
                    <span className="opacity-50">/</span>
                    <span>{title}</span>
                  </>
                )}
              </div>
              <h1 className="admin-title-anim truncate text-[22px] font-semibold tracking-[-0.01em] text-[#0B3C49] md:text-[25px]">{title}</h1>
            </div>

            <div className="relative hidden min-w-[180px] flex-[0_1_320px] shrink md:block">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search doctors, facilities, events"
                className="h-[42px] w-full rounded-lg border border-[#D5E2DE] bg-[#F7FAF9] px-3.5 text-[15px] text-[#16413A]"
              />
              {query.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-[10px] border border-[#E2ECE9] bg-white shadow-[0_22px_44px_-24px_rgba(10,50,44,0.4)]">
                  {results.length === 0 ? (
                    <div className="p-3.5 text-[15px] text-[#5A6A66]">No matches.</div>
                  ) : (
                    results.map((r) => (
                      <Link key={r.href} href={r.href} onClick={() => setQuery('')} className="flex justify-between gap-3 border-b border-[#F1F5F3] px-3.5 py-[11px] last:border-0 hover:bg-[#F1F8F6]">
                        <span className="text-[15px] text-[#16413A]">{r.title}</span>
                        <span className="flex-none text-[13px] text-[#7A8C87]">{r.type} · {r.status}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <Link
              href="/?preview=1"
              target="_blank"
              className="inline-flex h-[42px] flex-none items-center gap-2 whitespace-nowrap rounded-lg border border-[#9FD0C7] bg-white px-4 text-[15px] font-semibold text-[#0B5F55] hover:border-[#0A8E7B] hover:text-[#0B5F55] max-md:px-3 max-md:text-[14px]"
            >
              View website <AdminIcon name="external" size={15} />
            </Link>
          </div>
        </header>
        <main key={pathname} className="admin-view-anim mx-auto max-w-[1480px] px-4 pb-20 pt-7 md:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Shell>{children}</Shell>
    </AdminProvider>
  );
}
