'use client';

import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin/AdminContext';
import { pill, rel, titleOf } from '@/lib/admin/format';
import type { Collection } from '@/lib/admin/types';
import styles from '@/lib/admin/admin.module.css';

export default function AdminDashboardPage() {
  const admin = useAdmin();
  const router = useRouter();
  const db = admin.db;
  const user = admin.user;
  if (!user) return null;

  const open = (type: Collection, id?: string) => {
    admin.guard(() => router.push(id ? '/admin/' + type + '/' + id : '/admin/' + type + '/new'));
  };

  const all = (['doctors', 'facilities', 'events'] as const).flatMap((t) =>
    db[t].map((r) => Object.assign({ _t: t }, r)),
  );
  const week = Date.now() - 7 * 86400000;
  const today = new Date().toISOString().slice(0, 10);
  const h = new Date().getHours();

  const stats = [
    { label: 'Doctors', value: db.doctors.length, note: db.doctors.filter((r) => r.status === 'published').length + ' shown on the website', onClick: () => admin.guard(() => router.push('/admin/doctors')) },
    { label: 'Published facilities', value: db.facilities.filter((r) => r.status === 'published').length, note: 'of ' + db.facilities.length + ' facilities', onClick: () => admin.guard(() => router.push('/admin/facilities')) },
    { label: 'Events', value: db.events.length, note: db.events.filter((r) => r.date >= today).length + ' upcoming', onClick: () => admin.guard(() => router.push('/admin/events')) },
    { label: 'Drafts', value: all.filter((r) => r.status !== 'published').length, note: 'not visible on the website', onClick: () => admin.guard(() => { const first = all.find((r) => r.status !== 'published'); router.push(first ? '/admin/' + first._t : '/admin/doctors'); }) },
    { label: 'Updated this week', value: all.filter((r) => new Date(r.updatedAt).getTime() > week).length, note: 'across all content', onClick: () => {} },
  ];

  const recent = all
    .slice()
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 6);

  const activity = db.activity.slice(0, 10);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
        <h2 style={{ fontWeight: 600, fontSize: 28, margin: 0, color: '#0B3C49' }}>{(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening') + ', ' + user.name.split(' ')[0]}</h2>
        <span style={{ fontSize: 15.5, color: '#7A8C87' }}>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
      <div className={styles.statsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 26 }}>
        {stats.map((s) => (
          <button key={s.label} type="button" onClick={s.onClick} className={styles.hoverBorderSoft} style={{ textAlign: 'left', background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '20px 22px', cursor: 'pointer' }}>
            <div style={{ fontSize: 14.5, color: '#5A6A66', marginBottom: 8 }}>{s.label}</div>
            <div className={styles.statValue} style={{ fontWeight: 700, fontSize: 36, lineHeight: 1, color: '#0B3C49', marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 13.5, color: '#7A8C87' }}>{s.note}</div>
          </button>
        ))}
      </div>
      <div className={styles.dashCols} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(300px, 1fr)', gap: 20, alignItems: 'start', marginBottom: 20 }}>
        <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #EEF3F1', fontWeight: 600, fontSize: 18, color: '#0B3C49' }}>Recently updated</div>
          {recent.map((r) => {
            const p = pill(r.status);
            return (
              <button
                key={r._t + r.id}
                type="button"
                onClick={() => open(r._t, r.id)}
                className={styles.hoverBgRow + ' ' + styles.recentRow}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 110px 110px', gap: 16, alignItems: 'center', width: '100%', padding: '14px 22px', border: 'none', borderBottom: '1px solid #F1F5F3', background: '#ffffff', textAlign: 'left', cursor: 'pointer' }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#16413A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{titleOf(r)}</span>
                  <span style={{ display: 'block', fontSize: 13.5, color: '#7A8C87', marginTop: 2 }}>{({ doctors: 'Doctor', facilities: 'Facility', events: 'Event' } as const)[r._t]} · {r.updatedBy || ''}</span>
                </span>
                <span style={{ justifySelf: 'start', background: p.bg, color: p.color, fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>{p.label}</span>
                <span className={styles.recentTime} style={{ fontSize: 14, color: '#5A6A66', textAlign: 'right' }}>{rel(r.updatedAt)}</span>
              </button>
            );
          })}
        </section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '18px 22px 22px' }}>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#0B3C49', marginBottom: 14 }}>Quick actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" onClick={() => open('doctors')} className={styles.hoverBgDark} style={{ height: 46, border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>+ Add doctor</button>
              <button type="button" onClick={() => open('facilities')} className={styles.hoverBorderTeal} style={{ height: 46, border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>+ Add facility</button>
              <button type="button" onClick={() => open('events')} className={styles.hoverBorderTeal} style={{ height: 46, border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>+ Add event</button>
            </div>
          </section>
          <section style={{ background: '#FFFBF2', border: '1px solid #F3E2B8', borderRadius: 12, padding: '18px 22px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: 17, color: '#7A5205', marginBottom: 6 }}>Needs review</div>
            <p style={{ margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.5, color: '#8A6A2A' }}>These facilities have no description in the source content. Add one or confirm it with the hospital.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {db.facilities.filter((r) => r.review).map((r) => (
                <button key={r.id} type="button" onClick={() => open('facilities', r.id)} style={{ border: 'none', background: 'none', padding: 0, textAlign: 'left', fontSize: 15, fontWeight: 600, color: '#7A5205', cursor: 'pointer', textDecoration: 'underline' }}>{r.name}</button>
              ))}
            </div>
          </section>
        </div>
      </div>
      <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #EEF3F1', fontWeight: 600, fontSize: 18, color: '#0B3C49' }}>Activity log</div>
        {activity.map((a, i) => (
          <div key={a.id || i} className={styles.activityRow} style={{ display: 'grid', gridTemplateColumns: '130px 130px minmax(0, 1fr) 200px', gap: 16, alignItems: 'baseline', padding: '12px 22px', borderBottom: '1px solid #F1F5F3', fontSize: 15 }}>
            <span className={styles.actTime} style={{ color: '#7A8C87' }}>{rel(a.at)}</span>
            <span className={styles.actAction} style={{ fontWeight: 600, color: '#0B5F55' }}>{a.action}</span>
            <span className={styles.actWhat} style={{ color: '#16413A', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.type}: {a.title}</span>
            <span className={styles.actWho} style={{ color: '#7A8C87', textAlign: 'right' }}>{a.who}</span>
          </div>
        ))}
      </section>
    </>
  );
}
