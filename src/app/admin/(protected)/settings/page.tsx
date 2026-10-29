'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/components/admin/AdminProvider';
import { AdminIcon } from '@/components/admin/icons';
import { Button, ConfirmDialog, inputClass, Toast } from '@/components/admin/ui';
import TeamCard from '@/components/admin/TeamCard';

const KINDS: { key: string; label: string; hint: string }[] = [
  { key: 'doctors', label: 'Doctor specialities', hint: 'Used as filters on the Doctors page.' },
  { key: 'facilities', label: 'Facility sections', hint: 'Groups facilities on the Facilities page.' },
  { key: 'events', label: 'Event categories', hint: 'Shown on camps and events.' },
];

export default function SettingsPage() {
  const { profile, email, categories, doctors, facilities, events, isAdmin, addCategory, removeCategory, refresh, updateAccount } = useAdmin();
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'err' } | null>(null);
  const [busy, setBusy] = useState(false);
  const [newNames, setNewNames] = useState<Record<string, string>>({});
  const [remove, setRemove] = useState<{ id: string; name: string; kind: string; count: number } | null>(null);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [fullName, setFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountError, setAccountError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile?.full_name]);

  function countFor(kind: string, name: string) {
    if (kind === 'doctors') return doctors.filter((d) => d.speciality === name).length;
    if (kind === 'facilities') return facilities.filter((f) => f.category === name).length;
    return events.filter((e) => e.category === name).length;
  }

  async function saveAccount() {
    setAccountError('');
    if (!fullName.trim()) {
      setAccountError('Enter your name.');
      return;
    }
    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setAccountError('Use at least 8 characters for the new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setAccountError('The two passwords do not match.');
        return;
      }
    }
    setAccountBusy(true);
    try {
      await updateAccount(fullName.trim(), newPassword || undefined);
      setNewPassword('');
      setConfirmPassword('');
      setToast({ message: 'Your account has been updated.', tone: 'ok' });
    } catch (e) {
      setAccountError((e as Error).message);
    } finally {
      setAccountBusy(false);
    }
  }

  async function add(kind: string) {
    const name = (newNames[kind] || '').trim();
    if (!name) return;
    setBusy(true);
    try {
      await addCategory(kind, name);
      setNewNames((n) => ({ ...n, [kind]: '' }));
      setToast({ message: 'Category added.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    if (!restoreFile) return;
    setRestoring(true);
    try {
      const text = await restoreFile.text();
      const json = JSON.parse(text);
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(json),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'The backup could not be restored.');
      await refresh();
      setToast({ message: 'Backup restored.', tone: 'ok' });
      setRestoreFile(null);
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-[15px] text-[#5A6A66]">Your account, team and permissions, categories and a downloadable backup of the website content.</p>
      </div>

      <div className="space-y-5">
        <section className="rounded-2xl border border-[#E2ECE9] bg-white p-6">
          <h3 className="mb-1 text-[18.5px] font-semibold text-[#0B3C49]">Your account</h3>
          <p className="mb-4 text-[14.5px] leading-[1.55] text-[#5A6A66]">
            Your name as it appears in the activity log. Leave the password fields blank to keep your current password.
          </p>
          <div className="grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-[15px] font-semibold text-[#23423B]">Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className={`${inputClass} h-[46px] rounded-lg`}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-[15px] font-semibold text-[#23423B]">Email</span>
              <div className="flex h-[46px] items-center overflow-hidden rounded-lg border border-[#EEF3F1] bg-[#F7FAF9] px-3.5 text-[15.5px] text-[#7A8C87]">
                {email || '—'}
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-[15px] font-semibold text-[#23423B]">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep"
                autoComplete="new-password"
                className={`${inputClass} h-[46px] rounded-lg`}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-[15px] font-semibold text-[#23423B]">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat the new password"
                autoComplete="new-password"
                className={`${inputClass} h-[46px] rounded-lg`}
              />
            </div>
          </div>
          {accountError && (
            <p className="mt-3 text-[13.5px] font-medium text-[#B4251E]">{accountError}</p>
          )}
          <div className="mt-4">
            <Button type="button" onClick={saveAccount} disabled={accountBusy} className="!h-[46px] !rounded-[10px] !px-5 !text-[15.5px]">
              {accountBusy ? 'Saving…' : 'Save account'}
            </Button>
          </div>
        </section>

        <TeamCard />

        <section className="rounded-2xl border border-[#E2ECE9] bg-white p-6">
          <h3 className="mb-1 text-[18.5px] font-semibold text-[#0B3C49]">Categories</h3>
          <p className="mb-5 text-[14.5px] text-[#5A6A66]">Categories group content on the public website. Removing one does not delete the items using it.</p>
          <div className="grid gap-6 lg:grid-cols-3">
            {KINDS.map((kind) => {
              const list = categories.filter((c) => c.kind === kind.key);
              return (
                <div key={kind.key} className="rounded-xl border border-[#E2ECE9] p-4">
                  <div className="mb-1 text-[15px] font-semibold text-[#16413A]">{kind.label}</div>
                  <p className="mb-3 text-[12.5px] leading-[1.45] text-[#7A8C87]">{kind.hint}</p>
                  <div className="mb-3 space-y-1.5">
                    {list.length === 0 && <p className="text-[13px] text-[#7A8C87]">No categories yet.</p>}
                    {list.map((c) => {
                      const count = countFor(kind.key, c.name);
                      return (
                        <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#FAFCFB] px-2.5 py-1.5">
                          <span className="text-[13.5px] text-[#16413A]">
                            {c.name} <span className="text-[#7A8C87]">({count})</span>
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                if (count > 0) {
                                  setToast({
                                    message: `“${c.name}” is used by ${count} records. Move them to another category first.`,
                                    tone: 'err',
                                  });
                                  return;
                                }
                                setRemove({ id: c.id, name: c.name, kind: kind.key, count });
                              }}
                              disabled={busy}
                              className="text-[#B4251E] disabled:opacity-50"
                              aria-label={`Remove ${c.name}`}
                            >
                              <AdminIcon name="close" size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <input
                        value={newNames[kind.key] || ''}
                        onChange={(e) => setNewNames((n) => ({ ...n, [kind.key]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && add(kind.key)}
                        placeholder="Add category"
                        className="h-[36px] min-w-0 flex-1 rounded-lg border border-[#D5E2DE] px-2.5 text-[13.5px]"
                      />
                      <Button type="button" variant="outline" onClick={() => add(kind.key)} disabled={busy} className="!h-[36px] !px-3 !text-[13px]">Add</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#E2ECE9] bg-white p-6">
          <h3 className="mb-1 text-[18.5px] font-semibold text-[#0B3C49]">Backup</h3>
          <p className="mb-4 text-[14.5px] leading-[1.55] text-[#5A6A66]">
            Download a JSON copy of the content, or restore a previous backup. Only administrators can download or restore.
          </p>
          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/api/admin/backup"
                className="inline-flex h-[42px] items-center gap-2 rounded-lg bg-[#0A8E7B] px-4 text-[14.5px] font-semibold text-white hover:bg-[#0B7F73] hover:text-white"
              >
                <AdminIcon name="download" size={16} color="#fff" /> Download backup
              </a>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (f) setRestoreFile(f);
                }}
              />
              <Button variant="outline" icon="upload" onClick={() => fileRef.current?.click()}>Restore from a file</Button>
            </div>
          ) : (
            <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 text-[13.5px] text-[#8A6A2A]">Only administrators can download or restore backups.</p>
          )}
        </section>
      </div>

      {remove && (
        <ConfirmDialog
          title={`Remove “${remove.name}”?`}
          body="Items using this category keep their existing label, but it will no longer appear as a filter or section heading. You can add it again later."
          confirmLabel="Remove category"
          tone="danger"
          busy={busy}
          onCancel={() => setRemove(null)}
          onConfirm={async () => {
            setBusy(true);
            try {
              await removeCategory(remove.id);
              setRemove(null);
              setToast({ message: 'Category removed.', tone: 'ok' });
            } catch (e) {
              setToast({ message: (e as Error).message, tone: 'err' });
            } finally {
              setBusy(false);
            }
          }}
        />
      )}

      {restoreFile && (
        <ConfirmDialog
          title="Restore this backup?"
          body={`This will overwrite matching content with the contents of “${restoreFile.name}”. Download a fresh backup first if you are unsure.`}
          confirmLabel="Restore backup"
          tone="danger"
          busy={restoring}
          onCancel={() => setRestoreFile(null)}
          onConfirm={restore}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </>
  );
}
