'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/lib/admin/AdminContext';
import styles from '@/lib/admin/admin.module.css';

export default function AdminLoginPage() {
  const admin = useAdmin();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }
    setBusy(true);
    setError('');
    admin
      .signIn(email.trim(), password)
      .then(() => {
        setEmail('');
        setPassword('');
        setBusy(false);
        router.replace('/admin');
      })
      .catch(() => {
        setBusy(false);
        setError('That email and password don’t match an account. Check them and try again.');
      });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0B4F45', color: '#ffffff', padding: '56px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <img src="/admin-assets/home-mahabaleshwar.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.22 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(8,70,62,0.4) 0%, rgba(6,58,52,0.92) 100%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: '#ffffff', borderRadius: 12, padding: '8px 12px' }}><img src="/admin-assets/mgrh-logo.png" alt="MGRH" style={{ height: 54, width: 'auto', display: 'block' }} /></div>
        </div>
        <div style={{ position: 'relative', maxWidth: 520 }}>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C7EDE6', marginBottom: 14 }}>Content Manager</div>
          <h1 style={{ fontWeight: 600, fontSize: 40, lineHeight: 1.12, letterSpacing: '-0.02em', margin: '0 0 16px' }}>Keep the hospital website up to date.</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.86)', margin: 0 }}>Update doctors, facilities and events, upload photos, and publish when you’re ready. Nothing goes live until you press Publish.</p>
        </div>
        <div style={{ position: 'relative', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Morarji Gokuldas Rural Hospital, Mahabaleshwar</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <form onSubmit={submit} style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontWeight: 600, fontSize: 30, margin: '0 0 8px', color: '#0B3C49' }}>Sign in</h2>
          <p style={{ margin: '0 0 30px', fontSize: 16.5, color: '#5A6A66' }}>Use the account given to you by the hospital office.</p>
          <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 7 }}>Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            autoComplete="username"
            style={{ width: '100%', height: 50, padding: '0 14px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 16.5, color: '#16413A', background: '#ffffff', marginBottom: 18 }}
          />
          <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 7 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            autoComplete="current-password"
            style={{ width: '100%', height: 50, padding: '0 14px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 16.5, color: '#16413A', background: '#ffffff', marginBottom: 14 }}
          />
          {error ? (
            <div role="alert" style={{ background: '#FDF1F0', border: '1px solid #F6D8D5', color: '#9E2018', borderRadius: 8, padding: '12px 14px', fontSize: 15, marginBottom: 14 }}>{error}</div>
          ) : null}
          <button type="submit" className={styles.hoverBgDark} style={{ width: '100%', height: 52, border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 17, fontWeight: 700, cursor: 'pointer', marginTop: 6 }}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <div style={{ marginTop: 28, padding: '16px 18px', background: '#F1F8F6', border: '1px dashed #BFE3DB', borderRadius: 10, fontSize: 14.5, lineHeight: 1.6, color: '#45605A' }}>
            <strong style={{ color: '#0B4F45' }}>Prototype accounts</strong><br />
            Administrator: admin@mgrh-mahabaleshwar.org / mgrh-admin<br />
            Editor: editor@mgrh-mahabaleshwar.org / mgrh-editor
          </div>
        </form>
      </div>
    </div>
  );
}
