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

type SubItem = { name: string; text: string };

interface FacilityForm {
  name: string;
  category: string;
  subcategory: string;
  short_description: string;
  full_description: string;
  subitems: SubItem[];
  cover_index: number;
  needs_review: boolean;
  status: string;
}

const emptyFacility: FacilityForm = {
  name: '',
  category: '',
  subcategory: '',
  short_description: '',
  full_description: '',
  subitems: [],
  cover_index: 0,
  needs_review: false,
  status: 'draft',
};

export default function FacilitiesPage() {
  const {
    facilities,
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
  const [form, setForm] = useState<FacilityForm>(emptyFacility);
  const [images, setImages] = useState<Row[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'err' } | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; body: string; action: () => Promise<void> } | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const facilityCategories = useMemo(
    () => categories.filter((c) => c.kind === 'facilities').map((c) => c.name as string),
    [categories],
  );

  useEffect(() => {
    const editId = search?.get('edit');
    const isNew = search?.get('new');
    if (editId) {
      const row = facilities.find((f) => f.id === editId);
      if (row) openEdit(row);
    } else if (isNew) {
      openNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, facilities.length]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  function clearQuery() {
    if (search?.get('edit') || search?.get('new')) router.replace('/admin/facilities');
  }

  function openNew() {
    setEditing(null);
    setForm({ ...emptyFacility, category: facilityCategories[0] || '' });
    setImages([]);
    setErrors({});
  }

  async function openEdit(row: Row) {
    setEditing(row);
    setForm({
      name: row.name || '',
      category: row.category || '',
      subcategory: row.subcategory || '',
      short_description: row.short_description || '',
      full_description: row.full_description || '',
      subitems: Array.isArray(row.subitems) ? row.subitems : [],
      cover_index: row.cover_index || 0,
      needs_review: Boolean(row.needs_review),
      status: row.status || 'draft',
    });
    setErrors({});
    try {
      setImages(await loadGallery('facility', row.id));
    } catch {
      setImages([]);
    }
  }

  function closeForm() {
    setEditing(null);
    setForm(emptyFacility);
    setImages([]);
    setErrors({});
    clearQuery();
  }

  function validate(status: string) {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Enter the facility name.';
    if (!form.category.trim()) next.category = 'Choose a section for this facility.';
    if (status === 'published' && !form.short_description.trim()) {
      next.short_description = 'Add a short description before publishing.';
    }
    if (status === 'published' && !canPublish) {
      next.status = 'Your role can save drafts but not publish.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save(status: 'draft' | 'published') {
    if (!validate(status)) return;
    setBusy(true);
    try {
      await saveEntity(
        'facilities',
        {
          name: form.name.trim(),
          category: form.category.trim(),
          subcategory: form.subcategory.trim(),
          short_description: form.short_description.trim(),
          full_description: form.full_description.trim(),
          subitems: form.subitems.filter((s) => s.name.trim()),
          cover_index: form.cover_index,
          needs_review: form.needs_review || !form.short_description.trim(),
          status,
          sort_order: editing?.sort_order ?? facilities.length + 1,
        },
        editing?.id,
      );
      setToast({ message: status === 'published' ? 'Facility published.' : 'Draft saved.', tone: 'ok' });
      closeForm();
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    } finally {
      setBusy(false);
    }
  }

  const rows = facilities.filter((f) => {
    if (filter !== 'all' && f.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${f.name} ${f.category} ${f.subcategory}`.toLowerCase().includes(q);
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>();
    rows.forEach((r) => {
      const list = map.get(r.category) || [];
      list.push(r);
      map.set(r.category, list);
    });
    return Array.from(map.entries());
  }, [rows]);

  async function move(row: Row, dir: -1 | 1) {
    const ids = facilities.map((f) => f.id);
    const index = ids.indexOf(row.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorder('facilities', ids);
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
      await setStatus('facilities', row, next);
      setToast({ message: next === 'published' ? 'Facility published.' : 'Facility moved to draft.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  async function handleGalleryUpload(media: Row) {
    if (!editing || !media.id) return;
    try {
      await addGalleryImage('facility', editing.id, media.id);
      setImages(await loadGallery('facility', editing.id));
      await refresh();
      setToast({ message: 'Photo added.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  async function handleRemoveImage(image: Row) {
    try {
      const removedIndex = images.findIndex((i) => i.id === image.id);
      await removeGalleryImage('facility', image.id);
      const next = await loadGallery('facility', editing!.id);
      setImages(next);
      setForm((f) => {
        if (next.length === 0) return { ...f, cover_index: 0 };
        if (removedIndex > -1 && removedIndex < f.cover_index) return { ...f, cover_index: f.cover_index - 1 };
        if (f.cover_index >= next.length) return { ...f, cover_index: next.length - 1 };
        return f;
      });
      setToast({ message: 'Photo removed.', tone: 'ok' });
    } catch (e) {
      setToast({ message: (e as Error).message, tone: 'err' });
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] text-[#5A6A66]">Departments, services and the photos shown on the public website.</p>
          <p className="mt-1 text-[13.5px] text-[#7A8C87]">{facilities.length} facilities · {facilities.filter((f) => f.status === 'published').length} live</p>
        </div>
        <Button icon="plus" onClick={() => { openNew(); router.replace('/admin/facilities?new=1'); }}>Add a facility</Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8C87]"><AdminIcon name="search" size={16} /></span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search facilities" className="h-[42px] w-full rounded-lg border border-[#D5E2DE] bg-white pl-9 pr-3.5 text-[15px] text-[#16413A]" />
        </div>
        <div className="flex rounded-lg border border-[#D5E2DE] bg-white p-1">
          {[['all', 'All'], ['published', 'Published'], ['draft', 'Drafts']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-[14px] font-semibold ${filter === value ? 'bg-[#E1F3EF] text-[#0B6558]' : 'text-[#5A6A66]'}`}>{label}</button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No facilities yet"
          text="Add the departments and services the hospital provides."
          action={<Button icon="plus" onClick={() => { openNew(); router.replace('/admin/facilities?new=1'); }}>Add a facility</Button>}
        />
      ) : (
        <div className="space-y-7">
          {grouped.map(([category, list]) => (
            <div key={category}>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#7A8C87]">{category}</h3>
              <div className="overflow-hidden rounded-2xl border border-[#E2ECE9] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left">
                    <thead>
                      <tr className="border-b border-[#E2ECE9] bg-[#FAFCFB] text-[13px] uppercase tracking-[0.06em] text-[#7A8C87]">
                        <th className="px-5 py-3 font-semibold">Facility</th>
                        <th className="px-5 py-3 font-semibold">Services</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Order</th>
                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F3]">
                      {list.map((f) => (
                        <tr key={f.id} className="hover:bg-[#F7FBFA]">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 flex-none items-center justify-center overflow-hidden rounded-lg bg-[#E1F3EF]">
                                {mediaUrl(f.cover_media_id) ? <img src={mediaUrl(f.cover_media_id)!} alt="" className="h-full w-full object-cover" /> : <AdminIcon name="facilities" size={20} color="#0B6558" />}
                              </div>
                              <div>
                                <button type="button" onClick={() => { openEdit(f); router.replace(`/admin/facilities?edit=${f.id}`); }} className="text-left text-[15.5px] font-semibold text-[#16413A] hover:text-[#0A8E7B]">{f.name}</button>
                                <div className="flex items-center gap-2 text-[13px] text-[#7A8C87]">
                                  {f.subcategory || '—'}
                                  {f.needs_review && <span className="rounded-full bg-[#FFF8E8] px-2 py-0.5 text-[11.5px] font-semibold text-[#8A6A2A]">Needs review</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[14.5px] text-[#45605A]">{Array.isArray(f.subitems) && f.subitems.length ? `${f.subitems.length} listed` : '—'}</td>
                          <td className="px-5 py-3.5"><StatusBadge status={f.status} /></td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => move(f, -1)} aria-label="Move up" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2ECE9] text-[#5A6A66] hover:bg-[#F1F8F6]"><span className="-rotate-90"><AdminIcon name="chevron" size={14} /></span></button>
                              <button type="button" onClick={() => move(f, 1)} aria-label="Move down" className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E2ECE9] text-[#5A6A66] hover:bg-[#F1F8F6]"><span className="rotate-90"><AdminIcon name="chevron" size={14} /></span></button>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1.5">
                              <Button variant="ghost" icon="edit" onClick={() => { openEdit(f); router.replace(`/admin/facilities?edit=${f.id}`); }}>Edit</Button>
                              <Button variant="outline" onClick={() => togglePublish(f)} disabled={!canPublish}>{f.status === 'published' ? 'Unpublish' : 'Publish'}</Button>
                              {isAdmin && (
                                <Button variant="danger" icon="trash" onClick={() => setConfirm({
                                  title: `Delete ${f.name}?`,
                                  body: 'This removes the facility and its photo links from the website. It cannot be undone.',
                                  action: async () => { await deleteEntity('facilities', f.id, f.name); setToast({ message: 'Facility deleted.', tone: 'ok' }); },
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
            </div>
          ))}
        </div>
      )}

      {editing !== null || search?.get('new') ? (
        <Modal
          wide
          title={editing ? `Edit ${editing.name}` : 'Add a facility'}
          subtitle="Nothing appears on the public website until the facility is published."
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
            <Field label="Facility name" required error={errors.name}>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Radiology" />
            </Field>
            <Field label="Section" required error={errors.category} hint="Groups the facility on the public page.">
              <input list="facility-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-[44px] w-full rounded-lg border border-[#D5E2DE] bg-white px-3.5 text-[15.5px] text-[#16413A]" placeholder="Diagnostics" />
              <datalist id="facility-categories">
                {facilityCategories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </Field>
            <Field label="Sub-heading">
              <TextInput value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="Imaging services" />
            </Field>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-[14.5px] font-medium text-[#23423B]">
                <input type="checkbox" checked={form.needs_review} onChange={(e) => setForm({ ...form, needs_review: e.target.checked })} className="h-4 w-4 accent-[#0A8E7B]" />
                Needs review by the hospital
              </label>
            </div>
            <div className="md:col-span-2">
              <Field label="Short description" error={errors.short_description} hint="One or two sentences shown on cards.">
                <TextArea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} placeholder="What this facility offers, in plain language." />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Full description">
                <TextArea value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} className="min-h-[130px]" placeholder="Longer details shown on the Facilities page." />
              </Field>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[14.5px] font-semibold text-[#23423B]">Sub-facilities / services</div>
                  <p className="text-[13px] text-[#7A8C87]">For headings such as Radiology (X-Ray, 2D Echo, Sonography).</p>
                </div>
                <Button type="button" variant="outline" icon="plus" onClick={() => setForm({ ...form, subitems: [...form.subitems, { name: '', text: '' }] })}>Add service</Button>
              </div>
              <div className="space-y-2">
                {form.subitems.length === 0 && <p className="rounded-lg border border-dashed border-[#D5E2DE] px-3 py-3 text-[13.5px] text-[#7A8C87]">No sub-facilities added.</p>}
                {form.subitems.map((s, i) => (
                  <div key={i} className="grid gap-2 rounded-lg border border-[#E2ECE9] bg-[#FAFCFB] p-2.5 sm:grid-cols-[1fr_1.4fr_auto]">
                    <TextInput value={s.name} onChange={(e) => setForm({ ...form, subitems: form.subitems.map((x, n) => n === i ? { ...x, name: e.target.value } : x) })} placeholder="Service name" />
                    <TextInput value={s.text} onChange={(e) => setForm({ ...form, subitems: form.subitems.map((x, n) => n === i ? { ...x, text: e.target.value } : x) })} placeholder="Short note (optional)" />
                    <Button type="button" variant="danger" onClick={() => setForm({ ...form, subitems: form.subitems.filter((_, n) => n !== i) })}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 text-[14.5px] font-semibold text-[#23423B]">Photos</div>
              {images.length > 0 ? (
                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((img, i) => (
                    <div key={img.id} className={`overflow-hidden rounded-xl border ${form.cover_index === i ? 'border-[#0A8E7B] ring-2 ring-[#BFE3DB]' : 'border-[#E2ECE9]'}`}>
                      <div className="aspect-[4/3] bg-[#F4F7F6]">
                        <img src={mediaUrl(img.media_id) || ''} alt={img.alt || ''} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                        <button type="button" onClick={() => setForm({ ...form, cover_index: i })} className="text-[12.5px] font-semibold text-[#0B6558]">
                          {form.cover_index === i ? 'Cover photo' : 'Use as cover'}
                        </button>
                        <button type="button" onClick={() => handleRemoveImage(img)} className="text-[#B4251E]"><AdminIcon name="trash" size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-3 rounded-lg border border-dashed border-[#D5E2DE] px-3 py-3 text-[13.5px] text-[#7A8C87]">No photos yet. Save the facility first, then add photos.</p>
              )}
              {editing && (
                <ImageField preset="facility" value={null} label="Add a photo" onChange={handleGalleryUpload} hint="JPG, PNG or WebP · up to 5 MB · 4:3 crop" />
              )}
            </div>

            {errors.status && <div className="rounded-lg border border-[#F6D8D5] bg-[#FDF1F0] px-3 py-2 text-[13.5px] text-[#9E2018] md:col-span-2">{errors.status}</div>}
            {!canPublish && <p className="rounded-lg bg-[#FFF8E8] px-3 py-2 text-[13.5px] leading-[1.5] text-[#8A6A2A] md:col-span-2">Your role can save drafts. An administrator can publish this facility.</p>}
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
