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
  StatusBadge,
  TextArea,
  TextInput,
  Toast,
} from '@/components/admin/ui';

interface EventForm {
  title: string;
  category: string;
  event_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  summary: string;
  description: string;
  organiser: string;
  highlights: string;
  cover_id: string | null;
  cover_alt: string;
  placeholder_slots: number;
  status: string;
}

const emptyEvent: EventForm = {
  title: '',
  category: '',
  event_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  venue: '',
  summary: '',
  description: '',
  organiser: '',
  highlights: '',
  cover_id: null,
  cover_alt: '',
  placeholder_slots: 0,
  status: 'draft',
};

function formatDate(value?: string | null) {
  if (!value) return 'No date';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EventsPage() {
  const {
    events,
    categories,
    canPublish,
    isAdmin,
    mediaUrl,
    saveEntity,
    deleteEntity,
    setStatus,
    reorder,
    loadGallery,
    addGalleryImage,
    removeGalleryImage,
    refresh,
  } = useAdmin();
  const router = useRouter();
  const search = useSearchParams();
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<EventForm>(emptyEvent);
  const [images, setImages] = useState<Row[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'err' } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; body: string; action: () => Promise<void> } | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const eventCategories = useMemo(
    () => categories.filter((c) => c.kind === 'events').map((c) => c.name as string),
    [categories],
  );

  useEffect(() => {
    const editId = search?.get('edit');
    const isNew = search?.get('new');
    if (editId) {
      const row = events.find((e) => e.id === editId);
      if (row) openEdit(row);
    } else if (isNew) {
      openNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, events.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function clearQuery() {
    if (search?.get('edit') || search?.get('new')) router.replace('/admin/events');
  }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyEvent, category: eventCategories[0] || '' });
    setImages([]);
    setErrors({});
  }

  async function openEdit(row: Row) {
    setEditing(row);
    setForm({
      title: row.title || '',
      category: row.category || '',
      event_date: row.event_date || '',
      end_date: row.end_date || '',
      start_time: row.start_time || '',
      end_time: row.end_time || '',
      venue: row.venue || '',
      summary: row.summary || '',
      description: row.description || '',
      organiser: row.organiser || '',
      highlights: row.highlights || '',
      cover_id: row.cover_id || null,
      cover_alt: row.cover_alt || '',
      placeholder_slots: row.placeholder_slots || 0,
      status: row.status || 'draft',
    });
    setErrors({});
    try {
      setImages(await loadGallery('event', row.id));
    } catch {
      setImages([]);
    }
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyEvent);
    setImages([]);
    setErrors({});
    clearQuery();
  }

  function validate(status: string) {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Enter the event title.';
    if (!form.category.trim()) next.category = 'Choose a category.';
    if (form.event_date && form.end_date && form.end_date < form.event_date) {
      next.end_date = 'The end date cannot be before the start date.';
    }
    if (form.start_time && form.end_time && form.end_time <= form.start_time) {
      next.end_time = 'The end time must be after the start time.';
    }
    if (status === 'published' && !canPublish) next.status = 'Your role can save drafts but not publish.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(status: 'draft' | 'published') {
    if (!validate(status)) return;
    setBusy(true);
    try {
      await saveEntity(
        'events',
        {
          title: form.title.trim(),
          category: form.category.trim(),
          event_date: form.event_date || null,
          end_date: form.end_date || null,
          start_time: form.start_time || null,
          end_time: form.end_time || null,
          venue: form.venue.trim(),
          summary: form.summary.trim(),
          description: form.description.trim(),
          organiser: form.organiser.trim(),
          highlights: form.highlights.trim(),
          cover_id: form.cover_id,
          cover_alt: form.cover_alt.trim(),
          placeholder_slots: Number(form.placeholder_slots) || 0,
          status,
          sort_order: editing?.sort_order ?? events.length + 1,
        },
        editing?.id,
      );
      setToast({ message: status === 'published' ? 'Event published.' : 'Draft saved.', tone: 'ok' });
      closeForm();
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    } finally {
      setBusy(false);
    }
  }

  const rows = events.filter((e) => {
    if (filter !== 'all' && e.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${e.title} ${e.category} ${e.venue}`.toLowerCase().includes(q);
  });

  async function move(row: Row, dir: -1 | 1) {
    const ids = events.map((e) => e.id);
    const index = ids.indexOf(row.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorder('events', ids);
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
      await setStatus('events', row, next);
      setToast({ message: next === 'published' ? 'Event published.' : 'Event moved to draft.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  async function handleGalleryUpload(media: Row) {
    if (!editing || !media.id) return;
    try {
      await addGalleryImage('event', editing.id, media.id);
      setImages(await loadGallery('event', editing.id));
      await refresh();
      setToast({ message: 'Photo added.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  async function handleRemoveImage(image: Row) {
    try {
      await removeGalleryImage('event', image.id);
      setImages(await loadGallery('event', editing!.id));
      setToast({ message: 'Photo removed.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] text-[#5A6A66]">Camps, blood donation drives and school clinics.</p>
          <p className="mt-1 text-[13.5px] text-[#7A8C87]">{events.length} events · {events.filter((e) => e.status === 'published').length} live</p>
        </div>
        <Button icon="plus" onClick={() => { openNew(); router.replace('/admin/events?new=1'); }}>Add an event</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8C87]"><AdminIcon name="search" size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" className="h-[42px] w-full rounded-lg border border-[#D5E2DE] bg-white pl-9 pr-3.5 text-[15px] text-[#16413A]" />
        </div>
        <div className="flex rounded-lg border border-[#D5E2DE] bg-white p-1">
          {[['all', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-[14px] font-semibold ${filter === value ? 'bg-[#E1F3EF] text-[#0B6558]' : 'text-[#5A6A66]'}`}>{label}</button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No camps or events yet"
          text="Add upcoming camps and drives so patients know where to find them."
          action={<Button icon="plus" onClick={() => { openNew(); router.replace('/admin/events?new=1'); }}>Add an event</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2ECE9] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-[#E2ECE9] bg-[#FAFCFB] text-[13px] uppercase tracking-[0.06em] text-[#7A8C87]">
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F3]">
                {rows.map((e) => (
                  <tr key={e.id} className="hover:bg-[#F7FBFA]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-lg bg-[#FDF1E3]">
                          {mediaUrl(e.cover_media_id) ? <img src={mediaUrl(e.cover_media_id)!} alt="" className="h-full w-full object-cover" /> : <AdminIcon name="events" size={20} color="#8A5A06" />}
                        </div>
                        <div>
                          <button type="button" onClick={() => { openEdit(e); router.replace(`/admin/events?edit=${e.id}`); }} className="text-left text-[15.5px] font-semibold text-[#16413A] hover:text-[#0A8E7B]">{e.title}</button>
                          <div className="text-[13px] text-[#7A8C87]">{e.venue || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[14.5px] text-[#45605A]">{formatDate(e.event_date)}</td>
                    <td className="px-5 py-3.5 text-[14.5px] text-[#45605A]">{e.category}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={e.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => move(e, -1)} aria-label="Move up" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2ECE9] text-[#5A6A66] hover:bg-[#F1F8F6]"><span className="-rotate-90"><AdminIcon name="chevron" size={14} /></span></button>
                        <button type="button" onClick={() => move(e, 1)} aria-label="Move down" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2ECE9] text-[#5A6A66] hover:bg-[#F1F8F6]"><span className="rotate-90"><AdminIcon name="chevron" size={14} /></span></button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" icon="edit" onClick={() => { openEdit(e); router.replace(`/admin/events?edit=${e.id}`); }}>Edit</Button>
                        <Button variant="outline" onClick={() => togglePublish(e)} disabled={!canPublish}>{e.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
                        {isAdmin && (
                          <Button variant="danger" icon="trash" onClick={() => setConfirm({
                            title: `Delete ${e.title}?`,
                            body: 'This removes the event and its photo links from the website. It cannot be undone.',
                            action: async () => { await deleteEntity('events', e.id, e.title); setToast({ message: 'Event deleted.', tone: 'ok' }); },
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
          title={editing ? `Edit ${editing.title}` : 'Add an event'}
          subtitle="Nothing appears on the public website until the event is published."
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
            <Field label="Event title" required error={errors.title}>
              <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Free blood donation camp" />
            </Field>
            <Field label="Category" required error={errors.category}>
              <input list="event-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-[44px] w-full rounded-lg border border-[#D5E2DE] bg-white px-3.5 text-[15.5px] text-[#16413A]" placeholder="Blood Donation" />
              <datalist id="event-categories">
                {eventCategories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
            <Field label="Start date">
              <TextInput type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </Field>
            <Field label="End date" error={errors.end_date} hint="Leave blank for a single-day event.">
              <TextInput type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </Field>
            <Field label="Start time">
              <TextInput type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </Field>
            <Field label="End time" error={errors.end_time}>
              <TextInput type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </Field>
            <Field label="Venue">
              <TextInput value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Hospital campus, Mahabaleshwar" />
            </Field>
            <Field label="Organiser">
              <TextInput value={form.organiser} onChange={(e) => setForm({ ...form, organiser: e.target.value })} placeholder="MGRH / partner organisation" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Summary">
                <TextArea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} placeholder="One or two sentences shown on the Events page." />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Full description">
                <TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-[130px]" placeholder="Details about who the camp is for and what is offered." />
              </Field>
            </div>
            <Field label="Highlights">
              <TextInput value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder="Free haemoglobin check" />
            </Field>
            <Field label="Empty photo slots">
              <TextInput type="number" min={0} max={12} value={form.placeholder_slots} onChange={(e) => setForm({ ...form, placeholder_slots: Number(e.target.value) })} />
            </Field>

            <div className="md:col-span-2">
              <ImageField
                preset="event"
                value={mediaUrl(form.cover_id)}
                label="Cover photo"
                onChange={(media) => setForm({ ...form, cover_id: media.id || null })}
              />
            </div>
            <div className="md:col-span-2">
              <Field label="Cover photo description (alt text)">
                <TextInput value={form.cover_alt} onChange={(e) => setForm({ ...form, cover_alt: e.target.value })} placeholder="Describe the cover photo" />
              </Field>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 text-[14.5px] font-semibold text-[#23423B]">Event photos</div>
              {images.length > 0 ? (
                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img) => (
                    <div key={img.id} className="overflow-hidden rounded-xl border border-[#E2ECE9]">
                      <div className="aspect-[4/3] bg-[#F4F7F6]">
                        <img src={mediaUrl(img.media_id) || ''} alt={img.alt || ''} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex justify-end px-2 py-1.5">
                        <button type="button" onClick={() => handleRemoveImage(img)} className="text-[#B4251E]"><AdminIcon name="trash" size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-3 rounded-lg border border-dashed border-[#D5E2DE] px-3 py-3 text-[13.5px] text-[#7A8C87]">No photos yet. Save the event first, then add photos.</p>
              )}
              {editing && <ImageField preset="event" value={null} label="Add a photo" onChange={handleGalleryUpload} hint="JPG, PNG or WebP · up to 5 MB · 4:3 crop" />}
            </div>

            {errors.status && <div className="rounded-lg border border-[#F6D8D5] bg-[#FDF1F0] px-3 py-2 text-[13.5px] text-[#9E2018] md:col-span-2">{errors.status}</div>}
            {!canPublish && <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 text-[13.5px] leading-[1.5] text-[#8A6A2A] md:col-span-2">Your role can save drafts. An administrator can publish this event.</p>}
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
