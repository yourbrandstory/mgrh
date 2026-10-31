'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminProvider, useAdmin } from '@/lib/admin/AdminContext';
import { AdminModals } from '@/lib/admin/modals';
import { initials, pill, SING, titleOf } from '@/lib/admin/format';
import { IC, Icon } from '@/lib/admin/ui';
import styles from '@/lib/admin/admin.module.css';

const ROOT_STYLE = {
  fontFamily: "'DM Sans', sans-serif",
  color: '#16413A',
  minHeight: '100vh',
  background: '#F4F7F6',
} as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AdminGate>{children}</AdminGate>
    </AdminProvider>
  );
}

const NAV: { key: string; label: string; path: string; icon: string[] }[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin', icon: IC.dash },
  { key: 'doctors', label: 'Doctors', path: '/admin/doctors', icon: IC.doc },
  { key: 'facilities', label: 'Facilities', path: '/admin/facilities', icon: IC.fac },
  { key: 'events', label: 'Events', path: '/admin/events', icon: IC.evt },
  { key: 'media', label: 'Media Library', path: '/admin/media', icon: IC.media },
  { key: 'settings', label: 'Settings', path: '/admin/settings', icon: IC.set },
];

function navKeyFor(pathname: string): string {
  if (pathname.startsWith('/admin/doctors')) return 'doctors';
  if (pathname.startsWith('/admin/facilities')) return 'facilities';
  if (pathname.startsWith('/admin/events')) return 'events';
  if (pathname.startsWith('/admin/media')) return 'media';
  if (pathname.startsWith('/admin/settings')) return 'settings';
  return 'dashboard';
}

function AdminGate({ children }: { children: ReactNode }) {
  const admin = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (!admin.ready) return;
    if (isLogin) {
      if (admin.user) router.replace('/admin');
      return;
    }
    if (!admin.user) router.replace('/admin/login');
  }, [admin.ready, admin.user, isLogin, router]);

  if (!admin.ready) return <div className={styles.root} style={ROOT_STYLE} />;

  if (isLogin) {
    if (admin.user) return <div className={styles.root} style={ROOT_STYLE} />;
    return (
      <div className={styles.root} style={ROOT_STYLE}>
        {children}
      </div>
    );
  }

  if (!admin.user) return <div className={styles.root} style={ROOT_STYLE} />;

  const navKey = navKeyFor(pathname);
  const isForm = /^\/admin\/(doctors|facilities|events)\/(new|[^/]+)$/.test(pathname);
  const editType = (isForm ? pathname.split('/')[2] : null) as 'doctors' | 'facilities' | 'events' | null;
  const isNew = isForm && pathname.endsWith('/new');
  const collectionLabel = editType ? { doctors: 'Doctors', facilities: 'Facilities', events: 'Events' }[editType] : '';
  const views: Record<string, string> = {
    dashboard: 'Dashboard',
    doctors: 'Doctors',
    facilities: 'Facilities',
    events: 'Events',
    media: 'Media Library',
    settings: 'Settings',
  };
  const pageTitle = isForm && editType ? (isNew ? 'Add ' : 'Edit ') + SING[editType].toLowerCase() : views[navKey];
  const crumbs = isForm && editType
    ? [
        { label: 'Dashboard', onClick: () => admin.guard(() => router.push('/admin')) },
        { label: collectionLabel, onClick: () => admin.guard(() => router.push('/admin/' + editType)) },
      ]
    : navKey === 'dashboard'
      ? []
      : [{ label: 'Dashboard', onClick: () => admin.guard(() => router.push('/admin')) }];

  const tq = admin.topQ.trim().toLowerCase();
  const topResults = tq.length < 2
    ? []
    : (['doctors', 'facilities', 'events'] as const)
        .flatMap((t) =>
          admin.db[t]
            .filter((r) => titleOf(r).toLowerCase().includes(tq))
            .map((r) => ({
              type: t,
              id: r.id,
              title: titleOf(r),
              typeLabel: SING[t],
              status: pill(r.status).label,
            })),
        )
        .slice(0, 8);

  const pubPage = { doctors: '/doctors', facilities: '/facilities', events: '/events' }[navKey] || '/';

  return (
    <div className={styles.root} style={ROOT_STYLE}>
      <div style={{ display: 'grid', gridTemplateColumns: '248px minmax(0, 1fr)', minHeight: '100vh' }}>
        <aside style={{ position: 'sticky', top: 0, height: '100vh', background: '#ffffff', borderRight: '1px solid #E2ECE9', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid #EEF3F1', display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/admin-assets/mgrh-logo.png" alt="MGRH" style={{ height: 46, width: 'auto', display: 'block' }} />
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5A6A66', lineHeight: 1.3 }}>
              Content<br />Manager
            </div>
          </div>
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            {NAV.map((n) => {
              const on = navKey === n.key;
              return (
                <Link
                  key={n.key}
                  href={n.path}
                  onClick={(event) => {
                    admin.setTopQ('');
                    if (admin.dirty) {
                      event.preventDefault();
                      admin.guard(() => router.push(n.path));
                    }
                  }}
                  className={styles.hoverBgSoft}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '11px 14px',
                    border: 'none',
                    borderLeft: '3px solid ' + (on ? '#0A8E7B' : 'transparent'),
                    borderRadius: '0 8px 8px 0',
                    background: on ? '#E6F4F1' : 'transparent',
                    color: on ? '#0B4F45' : '#35514B',
                    fontSize: 16,
                    fontWeight: on ? 700 : 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Icon paths={n.icon} color={on ? '#0A8E7B' : '#5A6A66'} />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <div style={{ padding: '16px 18px', borderTop: '1px solid #EEF3F1', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 'none', width: 40, height: 40, borderRadius: '50%', background: '#E1F3EF', color: '#0A5F52', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(admin.user.name)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#16413A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin.user.name}</div>
              <div style={{ fontSize: 13, color: '#7A8C87' }}>{admin.user.role}</div>
            </div>
            <button
              type="button"
              onClick={() => admin.guard(() => { void admin.logout(); })}
              title="Log out"
              className={styles.hoverRedBoth}
              style={{ flex: 'none', border: '1px solid #D5E2DE', background: '#ffffff', color: '#35514B', borderRadius: 8, padding: '7px 10px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
            >
              Log out
            </button>
          </div>
        </aside>

        <div style={{ minWidth: 0 }}>
          <header style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid #E2ECE9' }}>
            <div style={{ padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#7A8C87', marginBottom: 3, minHeight: 18 }}>
                  {crumbs.map((c, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <button type="button" onClick={c.onClick} className={styles.hoverColorTeal} style={{ border: 'none', background: 'none', padding: 0, color: '#5A6A66', fontSize: 14, cursor: 'pointer' }}>{c.label}</button>
                      <span style={{ opacity: 0.5 }}>/</span>
                    </span>
                  ))}
                </div>
                <h1 style={{ fontWeight: 600, fontSize: 25, margin: 0, color: '#0B3C49', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pageTitle}</h1>
              </div>
              <div style={{ position: 'relative', width: 320, flex: 'none' }}>
                <input type="search" value={admin.topQ} onChange={(e) => admin.setTopQ(e.target.value)} placeholder="Search doctors, facilities, events" style={{ width: '100%', height: 42, padding: '0 14px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15, color: '#16413A', background: '#F7FAF9' }} />
                {topResults.length > 0 ? (
                  <div style={{ position: 'absolute', top: 48, left: 0, right: 0, background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 10, boxShadow: '0 22px 44px -24px rgba(10,50,44,0.4)', overflow: 'hidden' }}>
                    {topResults.map((r) => (
                      <button
                        key={r.type + r.id}
                        type="button"
                        onClick={() => admin.guard(() => router.push('/admin/' + r.type + '/' + r.id))}
                        className={styles.hoverBgSoft}
                        style={{ display: 'flex', justifyContent: 'space-between', gap: 12, width: '100%', padding: '11px 14px', border: 'none', borderBottom: '1px solid #F1F5F3', background: '#ffffff', textAlign: 'left', cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: 15, color: '#16413A' }}>{r.title}</span>
                        <span style={{ flex: 'none', fontSize: 13, color: '#7A8C87' }}>{r.typeLabel} · {r.status}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                {tq.length >= 2 && topResults.length === 0 ? (
                  <div style={{ position: 'absolute', top: 48, left: 0, right: 0, background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 10, padding: 14, fontSize: 15, color: '#5A6A66' }}>No matches.</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => window.open(encodeURI(pubPage), '_blank')}
                className={styles.hoverBorderTeal}
                style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 16px', border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                View website ↗
              </button>
            </div>
          </header>

          <main style={{ padding: '28px 32px 80px', maxWidth: 1480 }}>{children}</main>
        </div>
      </div>
      <AdminModals />
    </div>
  );
}
