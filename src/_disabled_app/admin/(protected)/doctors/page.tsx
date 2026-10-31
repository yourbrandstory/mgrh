'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdmin, type Row } from '@/components/admin/AdminProvider';
import { AdminIcon } from '@/components/admin/icons';
import ImageField from '@/components/admin/ImageField';
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  Select,
  StatusBadge,
  TextArea,
  TextInput,
  Toast,
} from '@/components/admin/ui';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const emptyDoctor = {
  name: '',
  designation: '',
  speciality: '',
  qualifications: '',
  experience: '',
  bio: '',
  schedule: '',
  days: [] as string[],
  start_time: '',
  end_time: '',
  location: '',
  contact: '',
  show_contact: false,
  image_id: null as string | null,
  image_alt: '',
  status: 'draft',
};

type DoctorForm = typeof emptyDoctor;

export default function DoctorsPage() {
  const { doctors, categories, canPublish, isAdmin, mediaUrl, saveEntity, deleteEntity, setStatus, reorder } = useAdmin();
  const router = useRouter();
  const search = useSearchParams();
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<DoctorForm>(emptyDoctor);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'err' } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; body: string; action: () => Promise<void> } | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const specialities = useMemo(
    () => categories.filter((c) => c.kind === 'doctors').map((c) => c.name as string),
    [categories],
  );

  useEffect(() => {
    const editId = search?.get('edit');
    const isNew = search?.get('new');
    if (editId) {
      const row = doctors.find((d) => d.id === editId);
      if (row) openEdit(row);
    } else if (isNew) {
      openNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, doctors.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function clearQuery() {
    if (search?.get('edit') || search?.get('new')) router.replace('/admin/doctors');
  }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyDoctor, speciality: specialities[0] || '' });
    setErrors({});
  }

  function openEdit(row: Row) {
    setEditing(row);
    setForm({
      name: row.name || '',
      designation: row.designation || '',
      speciality: row.speciality || '',
      qualifications: row.qualifications || '',
      experience: row.experience || '',
      bio: row.bio || '',
      schedule: row.schedule || '',
      days: Array.isArray(row.days) ? row.days : [],
      start_time: row.start_time || '',
      end_time: row.end_time || '',
      location: row.location || '',
      contact: row.contact || '',
      show_contact: Boolean(row.show_contact),
      image_id: row.image_id || null,
      image_alt: row.image_alt || '',
      status: row.status || 'draft',
    });
    setErrors({});
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyDoctor);
    setErrors({});
    clearQuery();
  }

  function validate(status: string) {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Enter the doctor’s name.';
    if (!form.speciality.trim()) next.speciality = 'Choose or type a speciality.';
    if (form.start_time && form.end_time && form.end_time <= form.start_time) {
      next.end_time = 'The end time must be after the start time.';
    }
    if (status === 'published' && !canPublish) {
      next.status = 'Your role can save drafts but not publish. Ask an administrator to publish this profile.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(status: 'draft' | 'published') {
    if (!validate(status)) return;
    setBusy(true);
    try {
      await saveEntity(
        'doctors',
        {
          name: form.name.trim(),
          designation: form.designation.trim(),
          speciality: form.speciality.trim(),
          qualifications: form.qualifications.trim(),
          experience: form.experience.trim(),
          bio: form.bio.trim(),
          schedule: form.schedule.trim(),
          days: form.days,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          location: form.location.trim(),
          contact: form.contact.trim(),
          show_contact: form.show_contact,
          image_id: form.image_id,
          image_alt: form.image_alt.trim(),
          status,
          sort_order: editing?.sort_order ?? doctors.length + 1,
        },
        editing?.id,
      );
      setToast({ message: status === 'published' ? 'Doctor published.' : 'Draft saved.', tone: 'ok' });
      closeForm();
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    } finally {
      setBusy(false);
    }
  }

  const rows = doctors.filter((d) => {
    if (filter !== 'all' && d.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${d.name} ${d.speciality} ${d.designation}`.toLowerCase().includes(q);
  });

  async function move(row: Row, dir: -1 | 1) {
    const ids = doctors.map((d) => d.id);
    const index = ids.indexOf(row.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorder('doctors', ids);
      setToast({ message: 'Order updated.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  async function togglePublish(row: Row) {
    const next = row.status === 'published' ? 'draft' : 'published';
    if (next === 'published' && !canPublish) {
      setToast({ message: 'Your role can save drafts but not publish.', tone: 'err' });
      return;
    }
    try {
      await setStatus('doctors', row, next);
      setToast({ message: next === 'published' ? 'Doctor published.' : 'Doctor moved to draft.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] text-[#5A6A66]">Names, specialities, consultation timings and photos.</p>
          <p className="mt-1 text-[13.5px] text-[#7A8C87]">{doctors.length} doctors · {doctors.filter((d) => d.status === 'published').length} live</p>
        </div>
        <Button icon="plus" onClick={() => { openNew(); router.replace('/admin/doctors?new=1'); }}>Add a doctor</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8C87]"><AdminIcon name="search" size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or speciality" className="h-[42px] w-full rounded-lg border border-[#D5E2DE] bg-white pl-9 pr-3.5 text-[15px] text-[#16413A]" />
        </div>
        <div className="flex rounded-lg border border-[#D5E2DE] bg-white p-1">
          {[['all', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-[14px] font-semibold ${filter === value ? 'bg-[#E1F3EF] text-[#0B6558]' : 'text-[#5A6A66]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No doctors here yet"
          text="Add the hospital’s medical team so patients can see who is available and when."
          action={<Button icon="plus" onClick={() => { openNew(); router.replace('/admin/doctors?new=1'); }}>Add a doctor</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2ECE9] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left">
              <thead>
                <tr className="border-b border-[#E2ECE9] bg-[#FAFCFB] text-[13px] uppercase tracking-[0.06em] text-[#7A8C87]">
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Speciality</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F3]">
                {rows.map((d) => (
                  <tr key={d.id} className="group hover:bg-[#F7FBFA]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-full bg-[#E1F3EF] text-[14px] font-bold text-[#0B6558]">
                          {mediaUrl(d.image_id) ? <img src={mediaUrl(d.image_id)!} alt="" className="h-full w-full object-cover" /> : (d.name || '?').replace(/^Dr\.?\s*/i, '').split(/\s+/).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <button type="button" onClick={() => { openEdit(d); router.replace(`/admin/doctors?edit=${d.id}`); }} className="text-left text-[15.5px] font-semibold text-[#16413A] hover:text-[#0A8E7B]">{d.name}</button>
                          <div className="text-[13px] text-[#7A8C87]">{d.designation || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[14.5px] text-[#45605A]">{d.speciality}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => move(d, -1)} aria-label="Move up" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2ECE9] text-[#5A6A66] hover:bg-[#F1F8F6]"><span className="-rotate-90"><AdminIcon name="chevron" size={14} /></span></button>
                        <button type="button" onClick={() => move(d, 1)} aria-label="Move down" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2ECE9] text-[#5A6A66] hover:bg-[#F1F8F6]"><span className="rotate-90"><AdminIcon name="chevron" size={14} /></span></button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" icon="edit" onClick={() => { openEdit(d); router.replace(`/admin/doctors?edit=${d.id}`); }}>Edit</Button>
                        <Button variant="outline" onClick={() => togglePublish(d)} disabled={!canPublish}>
                          {d.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                        {isAdmin && (
                          <Button variant="danger" icon="trash" onClick={() => setConfirm({
                            title: `Delete ${d.name}?`,
                            body: 'This removes the doctor from the website and cannot be undone.',
                            action: async () => { await deleteEntity('doctors', d.id, d.name); setToast({ message: 'Doctor deleted.', tone: 'ok' }); },
                          })}>Delete</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing !== null || search?.get('new') ? (
        <Modal
          wide
          title={editing ? `Edit ${editing.name}` : 'Add a doctor'}
          subtitle="Nothing appears on the public website until the profile is published."
          onClose={closeForm}
          footer={
            <>
              <Button variant="outline" onClick={closeForm} disabled={busy}>Cancel</Button>
              <Button variant="outline" onClick={() => save('draft')} disabled={busy}>Save draft</Button>
              <Button onClick={() => save('published')} disabled={busy || !canPublish}>{busy ? 'Saving…' : 'Save & publish'}</Button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Full Name" />
            </Field>
            <Field label="Designation">
              <TextInput value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Consultant Physician" />
            </Field>
            <Field label="Speciality" required error={errors.speciality} hint="Shown as the filter on the Doctors page.">
              <input
                list="specialities"
                value={form.speciality}
                onChange={(e) => setForm({ ...form, speciality: e.target.value })}
                className="h-[44px] w-full rounded-lg border border-[#D5E2DE] bg-white px-3.5 text-[15.5px] text-[#16413A]"
                placeholder="Medicine"
              />
              <datalist id="specialities">
                {specialities.map((s) => <option key={s} value={s} />)}
              </datalist>
            </Field>
            <Field label="Qualifications">
              <TextInput value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} placeholder="MBBS, MD" />
            </Field>
            <Field label="Experience">
              <TextInput value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="12 years" />
            </Field>
            <Field label="Location">
              <TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="OPD Room 3" />
            </Field>
            <Field label="Consultation days">
              <div className="flex flex-wrap gap-2 pt-1">
                {DAYS.map((day) => (
                  <label key={day} className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[13.5px] font-semibold ${form.days.includes(day) ? 'border-[#0A8E7B] bg-[#E1F3EF] text-[#0B6558]' : 'border-[#D5E2DE] bg-white text-[#5A6A66]'}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.days.includes(day)}
                      onChange={(e) => setForm({ ...form, days: e.target.checked ? [...form.days, day] : form.days.filter((d) => d !== day) })}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Schedule note">
              <TextInput value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Mon–Sat morning OPD" />
            </Field>
            <Field label="Start time">
              <TextInput type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </Field>
            <Field label="End time" error={errors.end_time}>
              <TextInput type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </Field>
            <Field label="Contact number">
              <TextInput value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Only if the hospital wants it public" />
            </Field>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-[14.5px] font-medium text-[#23423B]">
                <input type="checkbox" checked={form.show_contact} onChange={(e) => setForm({ ...form, show_contact: e.target.checked })} className="h-4 w-4 accent-[#0A8E7B]" />
                Show the contact number on the website
              </label>
            </div>
            <div className="md:col-span-2">
              <Field label="Profile summary">
                <TextArea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short, confirmed description of the doctor." />
              </Field>
            </div>
            <div className="md:col-span-2">
              <ImageField
                preset="doctor"
                value={mediaUrl(form.image_id)}
                label="Profile photo"
                onChange={(media) => setForm({ ...form, image_id: media.id || null })}
              />
            </div>
            <div className="md:col-span-2">
              <Field label="Photo description (alt text)" hint="Describe the photo for screen readers.">
                <TextInput value={form.image_alt} onChange={(e) => setForm({ ...form, image_alt: e.target.value })} placeholder="Dr. Name at the hospital" />
              </Field>
            </div>
            {errors.status && <div className="rounded-lg border border-[#F6D8D5] bg-[#FDF1F0] px-3 py-2 text-[13.5px] text-[#9E2018] md:col-span-2">{errors.status}</div>}
            {!canPublish && <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 text-[13.5px] leading-[1.5] text-[#8A6A2A] md:col-span-2">Your role can save drafts. An administrator can publish this profile.</p>}
          </div>
        </Modal>
      ) : null}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          body={confirm.body}
          confirmLabel="Delete"
          tone="danger"
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            setBusy(true);
            try {
              await confirm.action();
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
    </>
  );
}
