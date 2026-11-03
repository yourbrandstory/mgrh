'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/components/admin/AdminProvider';
import { Mark } from '@/components/admin/Icon';
import type { AdminRole } from '@/lib/admin/types';

export default function AdminLoginPage() {
  const admin = useAdmin();
  const router = useRouter();
  const [name, setName] = useState('Hospital staff');
  const [role, setRole] = useState<AdminRole>('Admin');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    await admin.login(name.trim() || 'Hospital staff', role);
    router.replace('/admin/doctors');
  };

  return (
    <div className="login">
      <form className="lcard" id="loginF" onSubmit={submit}>
        <div className="brandrow">
          <div className="mark">
            <Mark />
          </div>
          <div>
            <b style={{ fontSize: 18 }}>Morarji Gokuldas Rural Hospital</b>
            <small>Website content admin</small>
          </div>
        </div>
        <h1>Sign in</h1>
        <div className="fld" style={{ margin: 0 }}>
          <label htmlFor="ln">Your name</label>
          <input
            type="text"
            id="ln"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="fld" style={{ margin: 0 }}>
          <label htmlFor="lr">Role</label>
          <select
            id="lr"
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
          >
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
          </select>
        </div>
        <button className="btn pri" type="submit" disabled={busy}>
          Sign in
        </button>
        <p className="hint">
          Signs you in to the website content admin. Your name and role are recorded with every
          change you make.
        </p>
      </form>
    </div>
  );
}
