'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAdmin } from '@/lib/admin/AdminContext';
import { Sel } from '@/lib/admin/ui';
import * as S from '@/lib/admin/store';
import styles from '@/lib/admin/admin.module.css';
import type { AdminDb, Collection } from '@/lib/admin/types';

const ROLE_OPTIONS = [
  { value: 'Editor', label: 'Editor' },
  { value: 'Administrator', label: 'Administrator' },
];

const CAT_GROUPS: { key: Collection; label: string }[] = [
  { key: 'doctors', label: 'Doctor specialities' },
  { key: 'facilities', label: 'Facility sections' },
  { key: 'events', label: 'Event categories' },
];

export default function SettingsPage() {
  const admin = useAdmin();
  const importRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(admin.user ? admin.user.name : '');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [nu, setNu] = useState({ name: '', email: '', role: 'Editor' });
  const [cat, setCat] = useState<Record<string, string>>({});

  const db = admin.db;
  const user = admin.user;
  const isAdmin = admin.can('admin');
  if (!user) return null;

  const saveAccount = () => {
    if (!name.trim()) return admin.toast('Enter your name.', 'err');
    if (pass && pass.length < 8) return admin.toast('Use a password of at least 8 characters.', 'err');
    if (pass !== pass2) return admin.toast('The two passwords don’t match.', 'err');
    if (pass) {
      S.updatePassword(pass).catch((e: unknown) => admin.toast((e instanceof Error && e.message) || 'Password not changed.', 'err'));
    }
    if (
      admin.persist(
        (next: AdminDb) => {
          const x = next.settings.users.find((y) => y.email === user.email);
          if (x) {
            x.name = name.trim();
            if (pass) x.password = pass;
          }
        },
        { action: 'Updated account', type: 'Settings', title: user.email },
      )
    ) {
      const nextUser = { ...user, name: name.trim() };
      admin.updateSessionUser(nextUser);
      setPass('');
      setPass2('');
      admin.toast('Account details saved.');
    }
  };

  const addUser = () => {
    if (!admin.can('admin')) return admin.toast('Only administrators can add users.', 'err');
    const users = db.settings.users;
    if (!nu.name.trim() || !/^\S+@\S+\.\S+$/.test(nu.email)) return admin.toast('Enter a name and a valid email address.', 'err');
    if (users.some((x) => x.email.toLowerCase() === nu.email.toLowerCase())) return admin.toast('There is already an account with that email.', 'err');
    const temp = 'mgrh-' + Math.random().toString(36).slice(2, 8);
    if (
      admin.persist(
        (next: AdminDb) => {
          next.settings.users.push({ id: '', name: nu.name.trim(), email: nu.email.trim(), role: nu.role as 'Editor' | 'Administrator', password: temp });
        },
        { action: 'Added user', type: 'Settings', title: nu.email },
      )
    ) {
      setNu({ name: '', email: '', role: 'Editor' });
      admin.confirm({
        title: 'Account created',
        body: 'Share this temporary password with ' + nu.name.trim() + ': ' + temp + '. They can change it in Settings after signing in.',
        confirmLabel: 'Done',
        infoOnly: true,
        onConfirm: () => {},
      });
    }
  };

  const removeUser = (email: string) => {
    admin.confirm({
      title: 'Remove ' + email + '?',
      body: 'They will no longer be able to sign in to the Content Manager.',
      confirmLabel: 'Remove account',
      danger: true,
      onConfirm: () => {
        if (
          admin.persist(
            (next: AdminDb) => {
              next.settings.users = next.settings.users.filter((x) => x.email !== email);
            },
            { action: 'Removed user', type: 'Settings', title: email },
          )
        ) {
          admin.toast('Account removed.');
        }
      },
    });
  };

  const addCat = (k: Collection) => {
    const v = (cat[k] || '').trim();
    if (!v) return;
    if (db.categories[k].some((c) => c.toLowerCase() === v.toLowerCase())) return admin.toast('That category already exists.', 'err');
    if (
      admin.persist(
        (next: AdminDb) => {
          next.categories[k].push(v);
        },
        { action: 'Added category', type: 'Settings', title: v },
      )
    ) {
      setCat((prev) => ({ ...prev, [k]: '' }));
    }
  };

  const removeCat = (k: Collection, c: string) => {
    const n = db[k].filter((r) => (k === 'doctors' ? (r as { speciality?: string }).speciality : (r as { category?: string }).category) === c).length;
    if (n) return admin.toast('“' + c + '” is used by ' + n + ' ' + (n === 1 ? 'record' : 'records') + '. Move them to another category first.', 'err');
    admin.persist((next: AdminDb) => {
      next.categories[k] = next.categories[k].filter((x) => x !== c);
    }, { action: 'Removed category', type: 'Settings', title: c });
  };

  const moveCat = (k: Collection, i: number, dir: number) => {
    const j = i + dir;
    if (j < 0) return;
    admin.persist((next: AdminDb) => {
      const a = next.categories[k];
      [a[i], a[j]] = [a[j], a[i]];
    });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mgrh-cms-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    admin.toast('Backup downloaded.');
  };

  const onImportFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const fr = new FileReader();
    fr.onload = () => {
      let d: AdminDb;
      try {
        d = JSON.parse(String(fr.result)) as AdminDb;
      } catch {
        return admin.toast('That file isn’t a valid backup.', 'err');
      }
      if (!d || d.version !== 1 || !Array.isArray(d.doctors) || !Array.isArray(d.media)) return admin.toast('That file isn’t an MGRH Content Manager backup.', 'err');
      admin.confirm({
        title: 'Restore this backup?',
        body: 'All current content will be replaced with the backup from ' + f.name + '.',
        confirmLabel: 'Restore backup',
        danger: true,
        onConfirm: () => {
          try {
            S.commit(d);
            admin.toast('Backup restored.');
          } catch {
            admin.toast('The backup is too large for this browser’s storage.', 'err');
          }
        },
      });
    };
    fr.readAsText(f);
    e.target.value = '';
  };

  const resetData = () => {
    admin.confirm({
      title: 'Reset to the website’s original content?',
      body: 'Every change made in the Content Manager — including uploaded images and new accounts — will be removed. Download a backup first if you might need it.',
      confirmLabel: 'Reset everything',
      danger: true,
      onConfirm: () => {
        S.reset();
        admin.toast('Content reset to the original website content.');
      },
    });
  };

  return (
    <>
      <h2 style={{ fontWeight: 600, fontSize: 28, margin: '0 0 20px', color: '#0B3C49' }}>Settings</h2>
      <div className={styles.settingsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20, alignItems: 'start' }}>
        <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '22px 24px 24px' }}>
          <h3 style={{ fontWeight: 600, fontSize: 18.5, margin: '0 0 16px', color: '#0B3C49' }}>Your account</h3>
          <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 6 }}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15.5, color: '#16413A', marginBottom: 14 }} />
          <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 6 }}>Email</label>
          <div style={{ height: 44, padding: '0 12px', border: '1px solid #EEF3F1', borderRadius: 8, fontSize: 15.5, color: '#7A8C87', background: '#F7FAF9', display: 'flex', alignItems: 'center', marginBottom: 14 }}>{user.email}</div>
          <div className={styles.passGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 6 }}>New password</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Leave blank to keep" style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15.5 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 6 }}>Confirm password</label>
              <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} style={{ width: '100%', height: 44, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15.5 }} />
            </div>
          </div>
          <button type="button" onClick={saveAccount} style={{ height: 44, padding: '0 20px', border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 15.5, fontWeight: 600, cursor: 'pointer' }}>Save account</button>
        </section>

        <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '22px 24px 24px' }}>
          <h3 style={{ fontWeight: 600, fontSize: 18.5, margin: '0 0 6px', color: '#0B3C49' }}>Team &amp; permissions</h3>
          <p style={{ margin: '0 0 14px', fontSize: 14.5, color: '#7A8C87' }}>Administrators can do everything. Editors can add and edit content; publishing is set below.</p>
          {!isAdmin ? <p style={{ margin: '0 0 12px', fontSize: 14.5, color: '#8A5A06' }}>Only administrators can change these settings.</p> : null}
          <label style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15.5, color: '#23423B', marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={!!db.settings.editorsCanPublish}
              onChange={(e) =>
                admin.persist(
                  (next: AdminDb) => {
                    next.settings.editorsCanPublish = e.target.checked;
                  },
                  { action: 'Changed permissions', type: 'Settings', title: e.target.checked ? 'Editors can publish' : 'Only administrators can publish' },
                )
              }
              disabled={!isAdmin}
              style={{ width: 20, height: 20, accentColor: '#0A8E7B' }}
            />
            Editors can publish and unpublish
          </label>
          <div style={{ borderTop: '1px solid #EEF3F1' }}>
            {db.settings.users.map((us) => {
              const canRemove = isAdmin && us.email !== user.email;
              return (
                <div key={us.email} className={styles.teamRow} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F1F5F3' }}>
                  <div className={styles.teamInfo} style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.teamName} style={{ fontSize: 15.5, fontWeight: 600, color: '#16413A' }}>{us.name}</div>
                    <div className={styles.teamMeta} style={{ fontSize: 13.5, color: '#7A8C87' }}>
                      <span className={styles.teamEmail}>{us.email}</span>
                      <span className={styles.teamDot}>{' · '}</span>
                      <span className={styles.teamRole}>{us.role}</span>
                    </div>
                  </div>
                  {canRemove ? (
                    <button type="button" onClick={() => removeUser(us.email)} className={styles.teamRemove} style={{ height: 32, padding: '0 10px', border: '1px solid #F0D2CF', borderRadius: 7, background: '#ffffff', color: '#B4251E', fontSize: 13.5, cursor: 'pointer' }}>Remove</button>
                  ) : null}
                </div>
              );
            })}
          </div>
          {isAdmin ? (
            <div className={styles.addUserGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
              <input type="text" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} placeholder="Name" style={{ height: 44, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15 }} />
              <input type="email" value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} placeholder="Email" style={{ height: 44, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15 }} />
              <Sel value={nu.role} options={ROLE_OPTIONS} onChange={(e) => setNu({ ...nu, role: e.target.value })} extra={{ minWidth: 150 }} />
              <button type="button" onClick={addUser} style={{ height: 44, border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Add account</button>
            </div>
          ) : null}
        </section>

        <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '22px 24px 24px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontWeight: 600, fontSize: 18.5, margin: '0 0 6px', color: '#0B3C49' }}>Categories</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14.5, color: '#7A8C87' }}>These drive the filters on the public website. A category that’s still in use can’t be removed.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 22 }}>
            {CAT_GROUPS.map((cg) => (
              <div key={cg.key}>
                <div style={{ fontSize: 15.5, fontWeight: 600, color: '#0B5F55', marginBottom: 8 }}>{cg.label}</div>
                {db.categories[cg.key].map((c, i) => {
                  const count = db[cg.key].filter((r) => (cg.key === 'doctors' ? (r as { speciality?: string }).speciality : (r as { category?: string }).category) === c).length;
                  return (
                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #F1F5F3' }}>
                      <span style={{ flex: 1, fontSize: 15, color: '#16413A' }}>{c} <span style={{ color: '#7A8C87' }}>({count})</span></span>
                      <button type="button" onClick={() => moveCat(cg.key, i, -1)} aria-label="Move up" style={{ height: 28, width: 30, border: '1px solid #E2ECE9', borderRadius: 6, background: '#ffffff', color: '#35514B', fontSize: 11, cursor: 'pointer' }}>▲</button>
                      <button type="button" onClick={() => removeCat(cg.key, c)} aria-label="Remove" style={{ height: 28, width: 30, border: '1px solid #F0D2CF', borderRadius: 6, background: '#ffffff', color: '#B4251E', cursor: 'pointer' }}>✕</button>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <input type="text" value={cat[cg.key] || ''} onChange={(e) => setCat({ ...cat, [cg.key]: e.target.value })} placeholder="New category" style={{ flex: 1, minWidth: 0, height: 40, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15 }} />
                  <button type="button" onClick={() => addCat(cg.key)} style={{ height: 40, padding: '0 14px', border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Add</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '22px 24px 24px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontWeight: 600, fontSize: 18.5, margin: '0 0 6px', color: '#0B3C49' }}>Backup &amp; restore</h3>
          <p style={{ margin: '0 0 16px', fontSize: 14.5, color: '#7A8C87' }}>Download a copy of all content and images, or restore from an earlier backup.</p>
          <div className={styles.backupRow} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={exportData} className={styles.backupBtn} style={{ height: 44, padding: '0 18px', border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Download backup</button>
            <button type="button" onClick={() => importRef.current && importRef.current.click()} className={styles.backupBtn} style={{ height: 44, padding: '0 18px', border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Restore from backup</button>
            {isAdmin ? (
              <button type="button" onClick={resetData} className={styles.backupBtn} style={{ height: 44, padding: '0 18px', border: '1px solid #F0D2CF', borderRadius: 8, background: '#ffffff', color: '#B4251E', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Reset to original website content</button>
            ) : null}
          </div>
          <input type="file" ref={importRef} accept="application/json" onChange={onImportFile} style={{ display: 'none' }} />
        </section>
      </div>
    </>
  );
}
