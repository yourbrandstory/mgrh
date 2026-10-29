'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'no-profile') {
      setError('This account does not have access to the website editor. Ask an administrator to add you to the team.');
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!hasSupabaseEnv) {
      setError('Supabase is not configured. Add the environment variables first.');
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setBusy(false);
      setError('That email and password do not match an account.');
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      : { data: null };
    if (!profile) {
      await supabase.auth.signOut();
      setBusy(false);
      setError('This account does not have access to the website editor.');
      return;
    }
    router.replace('/admin/dashboard');
    router.refresh();
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[#0B4F45] px-[60px] py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <img src="/images/admin-login.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#08463E]/40 to-[#063A34]/95" />
        <div className="relative flex items-center gap-[14px]">
          <div className="rounded-xl bg-white px-3 py-2">
            <img src="/images/logo.png" alt="MGRH" className="block h-[54px] w-auto" />
          </div>
        </div>
        <div className="relative max-w-[520px]">
          <div className="mb-[14px] text-[14px] font-semibold uppercase tracking-[0.14em] text-[#C7EDE6]">Website editor</div>
          <h1 className="mb-4 text-[40px] font-semibold leading-[1.12] tracking-[-0.02em]">
            Keep the hospital website up to date.
          </h1>
          <p className="text-[18px] leading-[1.6] text-white/85">
            Update doctors, facilities and events, upload photos, and publish when you’re ready. Nothing goes live until you press Publish.
          </p>
        </div>
        <div className="relative text-[14px] text-white/70">Morarji Gokuldas Rural Hospital, Mahabaleshwar</div>
      </div>

      <div className="flex items-center justify-center p-10">
        <form onSubmit={onSubmit} className="w-full max-w-[420px]">
          <h2 className="mb-2 text-[30px] font-semibold text-[#0B3C49]">Sign in</h2>
          <p className="mb-[30px] text-[16.5px] text-[#5A6A66]">Use the account given to you by the hospital office.</p>

          <label className="mb-[7px] block text-[15px] font-semibold text-[#23423B]">Email address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            className="mb-[18px] h-[50px] w-full rounded-lg border border-[#D5E2DE] bg-white px-[14px] text-[16.5px] text-[#16413A]"
          />

          <label className="mb-[7px] block text-[15px] font-semibold text-[#23423B]">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mb-[14px] h-[50px] w-full rounded-lg border border-[#D5E2DE] bg-white px-[14px] text-[16.5px] text-[#16413A]"
          />

          {error && (
            <div role="alert" className="mb-[14px] rounded-lg border border-[#F6D8D5] bg-[#FDF1F0] px-[14px] py-3 text-[15px] text-[#9E2018]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1.5 h-[52px] w-full rounded-lg bg-[#0A8E7B] text-[17px] font-bold text-white hover:bg-[#0B7F73] disabled:opacity-70"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="mt-7 text-center text-[14px] leading-[1.6] text-[#45605A]">
            Staff accounts are created by an administrator. Contact the hospital office if you need access.
          </p>
        </form>
      </div>
    </div>
  );
}
