'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from './AdminProvider';
import { AdminIcon } from './icons';
import { Button, ConfirmDialog, Field, Modal, Select, TextInput, Toast } from './ui';

interface TeamMember {
  id: string;
  full_name: string;
  role: 'administrator' | 'editor';
  email: string;
  created_at: string;
}

export default function TeamCard() {
  const { isAdmin, profile, settings, saveSettings, inviteUser, removeUser, updateRole } = useAdmin();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'editor' });
  const [busy, setBusy] = useState(false);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'err' } | null>(null);
  const [confirm, setConfirm] = useState<TeamMember | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/team');
      const body = await res.json();
      if (res.ok) setTeam(body.team || []);
    } catch {
      // Keep the existing list.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(t);
  }, [toast]);

  async function togglePublish(value: boolean) {
    setToggleBusy(true);
    try {
      await saveSettings({ editors_can_publish: value });
      setToast({ message: value ? 'Editors can now publish.' : 'Publishing is limited to administrators.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    } finally {
      setToggleBusy(false);
    }
  }

  async function sendInvite() {
    setBusy(true);
    try {
      const message = await inviteUser(form.email, form.fullName, form.role);
      setToast({ message, tone: 'ok' });
      setInvite(false);
      setForm({ fullName: '', email: '', role: 'editor' });
      await load();
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(member: TeamMember, role: string) {
    if (!isAdmin || member.role === role) return;
    try {
      await updateRole(member.id, role);
      setTeam((list) => list.map((m) => (m.id === member.id ? { ...m, role: role as TeamMember['role'] } : m)));
      setToast({ message: 'Role updated.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  return (
    <section className="rounded-2xl border border-[#E2ECE9] bg-white p-6">
      <h3 className="mb-1 text-[18.5px] font-semibold text-[#0B3C49]">Team &amp; permissions</h3>
      <p className="mb-4 text-[14.5px] leading-[1.55] text-[#5A6A66]">
        Administrators can do everything. Editors can add and edit content; publishing is set below. There is no public
        sign-up — staff are invited by an administrator.
      </p>
      {!isAdmin && (
        <p className="mb-4 rounded-lg bg-[#FFF8E8] px-3 py-2 text-[13.5px] text-[#8A6A2A]">
          Only administrators can change these settings.
        </p>
      )}

      <label
        className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3.5 ${
          isAdmin ? 'border-[#E2ECE9] bg-[#FAFCFB]' : 'border-[#F1DFB6] bg-[#FFF8E8]'
        }`}
      >
        <input
          type="checkbox"
          disabled={!isAdmin || toggleBusy}
          checked={Boolean(settings?.editors_can_publish)}
          onChange={(e) => togglePublish(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#0A8E7B]"
        />
        <span>
          <span className="block text-[15px] font-semibold text-[#16413A]">Editors can publish and unpublish</span>
          <span className="mt-0.5 block text-[13.5px] leading-[1.5] text-[#7A8C87]">
            {isAdmin ? 'When off, only administrators can publish or unpublish.' : 'Only administrators can change this setting.'}
          </span>
        </span>
      </label>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[14.5px] text-[#7A8C87]">
          {loading ? 'Loading the team…' : `${team.length} account${team.length === 1 ? '' : 's'} can sign in.`}
        </span>
        {isAdmin && (
          <Button icon="plus" onClick={() => setInvite(true)} disabled={busy}>
            Invite a staff member
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E2ECE9]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-[#E2ECE9] bg-[#FAFCFB] text-[13px] uppercase tracking-[0.06em] text-[#7A8C87]">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F3]">
              {!loading && team.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[15px] text-[#7A8C87]">
                    No staff accounts found.
                  </td>
                </tr>
              )}
              {team.map((m) => (
                <tr key={m.id} className="hover:bg-[#F7FBFA]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#E1F3EF] text-[13px] font-bold text-[#0B6558]">
                        {(m.full_name || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[15.5px] font-semibold text-[#16413A]">{m.full_name || 'Unnamed staff member'}</div>
                        <div className="text-[13px] text-[#7A8C87]">
                          {m.id === profile?.id
                            ? 'You'
                            : `Added ${new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[14.5px] text-[#45605A]">{m.email || '—'}</td>
                  <td className="px-5 py-3.5">
                    {isAdmin && m.id !== profile?.id ? (
                      <Select value={m.role} onChange={(e) => changeRole(m, e.target.value)} className="!h-[38px] !w-[170px] !text-[14px]">
                        <option value="editor">Editor</option>
                        <option value="administrator">Administrator</option>
                      </Select>
                    ) : (
                      <span className="rounded-full bg-[#F1F8F6] px-2.5 py-1 text-[12.5px] font-semibold capitalize text-[#0B6558]">
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {isAdmin && m.id !== profile?.id ? (
                      <Button variant="danger" icon="trash" onClick={() => setConfirm(m)}>Remove</Button>
                    ) : (
                      <span className="text-[13px] text-[#7A8C87]">
                        {m.id === profile?.id ? 'Current account' : 'Administrator'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E2ECE9] bg-[#FAFCFB] px-4 py-3.5">
        <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[#F1F8F6] text-[#0A8E7B]">
          <AdminIcon name="team" size={17} />
        </span>
        <div>
          <div className="text-[14.5px] font-semibold text-[#16413A]">
            Editors save drafts. Administrators publish, delete and manage the team.
          </div>
          <p className="mt-1 text-[13.5px] leading-[1.55] text-[#7A8C87]">
            Invitations are sent by email from Supabase; new passwords are chosen by the person accepting the invite.
          </p>
        </div>
      </div>

      {invite && (
        <Modal
          title="Invite a staff member"
          subtitle="They will receive an email invitation to choose a password."
          onClose={() => setInvite(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setInvite(false)} disabled={busy}>Cancel</Button>
              <Button onClick={sendInvite} disabled={busy}>{busy ? 'Sending…' : 'Send invitation'}</Button>
            </>
          }
        >
          <div className="grid gap-4">
            <Field label="Full name" required>
              <TextInput value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" />
            </Field>
            <Field label="Email address" required>
              <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" />
            </Field>
            <Field label="Role" hint="Editors can create and update drafts. Administrators can publish, delete and manage accounts.">
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="editor">Editor</option>
                <option value="administrator">Administrator</option>
              </Select>
            </Field>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          title={`Remove ${confirm.full_name}?`}
          body="They will no longer be able to sign in to the Content Manager. Their past activity stays in the log."
          confirmLabel="Remove account"
          tone="danger"
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            setBusy(true);
            try {
              await removeUser(confirm.id);
              setTeam((list) => list.filter((m) => m.id !== confirm.id));
              setToast({ message: 'Account removed.', tone: 'ok' });
              setConfirm(null);
            } catch (e) {
              setToast({ message: (e as Error).message, tone: 'err' });
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </section>
  );
}
