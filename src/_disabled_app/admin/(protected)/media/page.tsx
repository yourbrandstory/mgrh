'use client';

import { useState } from 'react';
import { useAdmin, type Row } from '@/components/admin/AdminProvider';
import { AdminIcon } from '@/components/admin/icons';
import { Button, ConfirmDialog, Toast } from '@/components/admin/ui';

const PRESET_LABEL: Record<string, string> = {
  doctor: 'Doctor · 800 × 800',
  facility: 'Facility · 1200 × 900',
  event: 'Event · 1200 × 900',
};

export default function MediaPage() {
  const { media, mediaUrl, removeMedia, isAdmin, mediaUsage } = useAdmin();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [confirm, setConfirm] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: 'ok' | 'err' } | null>(null);

  const usageOf = (id: string) => mediaUsage[id] || [];
  const rows = media.filter((m) => {
    const q = query.trim().toLowerCase();
    if (q && !String(m.file_name).toLowerCase().includes(q)) return false;
    const used = usageOf(m.id);
    if (filter === 'unused') return used.length === 0;
    if (filter !== 'all') {
      const prefix = filter === 'doctors' ? 'doctor' : filter === 'facilities' ? 'facility' : 'event';
      return used.some((u) => u.toLowerCase().startsWith(prefix));
    }
    return true;
  });

  const actions = (m: Row) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="!h-[34px] !px-3 !text-[12.5px]"
        onClick={() => {
          const url = mediaUrl(m.id);
          if (url) {
            navigator.clipboard?.writeText(url);
            setToast({ message: 'Image URL copied.', tone: 'ok' });
          }
        }}
      >
        Copy URL
      </Button>
      {isAdmin && <Button variant="danger" className="!h-[34px] !px-3 !text-[12.5px]" onClick={() => setConfirm(m)}>Delete</Button>}
    </div>
  );

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="min-w-[220px] flex-[1_1_240px]">
          <p className="text-[15px] text-[#5A6A66]">Every photo uploaded through the editor, newest first.</p>
          <p className="mt-1 text-[13.5px] text-[#7A8C87]">{rows.length} of {media.length} images</p>
        </div>
        <div className="relative min-w-[180px] flex-[1_1_260px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7A8C87]"><AdminIcon name="search" size={16} /></span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name"
            className="h-[42px] w-full rounded-lg border border-[#D5E2DE] bg-white pl-9 pr-3.5 text-[15px] text-[#16413A]"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-[42px] flex-none rounded-lg border border-[#D5E2DE] bg-white px-3 text-[15px] text-[#16413A]"
          aria-label="Filter by usage"
        >
          <option value="all">All images</option>
          <option value="doctors">Used by doctors</option>
          <option value="facilities">Used by facilities</option>
          <option value="events">Used by events</option>
          <option value="unused">Not used anywhere</option>
        </select>
        <div className="flex flex-none overflow-hidden rounded-lg border border-[#D5E2DE]">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`h-[42px] px-4 text-[15px] font-semibold ${view === 'grid' ? 'bg-[#0A8E7B] text-white' : 'bg-white text-[#35514B]'}`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`h-[42px] px-4 text-[15px] font-semibold ${view === 'list' ? 'bg-[#0A8E7B] text-white' : 'bg-white text-[#35514B]'}`}
          >
            List
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5E2DE] bg-white px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1F8F6] text-[#0A8E7B]"><AdminIcon name="image" size={24} /></div>
          <h3 className="text-[19px] font-semibold text-[#0B3C49]">No photos uploaded</h3>
          <p className="mx-auto mt-2 max-w-[420px] text-[15px] leading-[1.6] text-[#5A6A66]">Photos added to doctors, facilities and events appear here.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
          {rows.map((m) => (
            <div key={m.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#E2ECE9] bg-white">
              <div className="aspect-[4/3] bg-[#F4F7F6]">
                <img src={mediaUrl(m.id) || ''} alt={m.file_name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <div className="truncate text-[14px] font-semibold text-[#16413A]" title={m.file_name}>{m.file_name}</div>
                <div className="mt-0.5 text-[12.5px] text-[#7A8C87]">{PRESET_LABEL[m.preset] || m.preset}</div>
                <div className="mt-1 text-[12.5px] text-[#7A8C87]">
                  {new Date(m.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div
                  className="mt-0.5 truncate text-[12.5px] leading-[1.4]"
                  style={{ color: usageOf(m.id).length ? '#0A5F52' : '#8A5A06' }}
                  title={usageOf(m.id).join(' · ') || 'Not used yet'}
                >
                  {usageOf(m.id).length ? usageOf(m.id).join(' · ') : 'Not used yet'}
                </div>
                <div className="mt-auto flex gap-2 pt-3">{actions(m)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E2ECE9] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-[#E2ECE9] bg-[#FAFCFB] text-[13px] uppercase tracking-[0.06em] text-[#7A8C87]">
                  <th className="px-4 py-3 font-semibold"></th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Dimensions</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Uploaded</th>
                  <th className="px-4 py-3 font-semibold">Used by</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F3]">
                {rows.map((m) => {
                  const used = usageOf(m.id);
                  return (
                    <tr key={m.id} className="hover:bg-[#F7FBFA]">
                      <td className="px-4 py-2.5">
                        <img src={mediaUrl(m.id) || ''} alt="" className="h-[60px] w-20 rounded-md object-cover" />
                      </td>
                      <td className="max-w-[220px] px-4 py-2.5">
                        <div className="truncate text-[14.5px] font-semibold text-[#16413A]" title={m.file_name}>{m.file_name}</div>
                      </td>
                      <td className="px-4 py-2.5 text-[14px] text-[#45605A]">{m.width} × {m.height} px</td>
                      <td className="px-4 py-2.5 text-[14px] text-[#45605A]">
                        {Math.max(1, Math.round((Number(m.size_bytes) / 1024) * 10) / 10)} KB
                      </td>
                      <td className="px-4 py-2.5 text-[14px] text-[#45605A]">{String(m.mime_type || '').replace('image/', '').toUpperCase()}</td>
                      <td className="px-4 py-2.5 text-[14px] text-[#45605A]">
                        {new Date(m.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="max-w-[260px] px-4 py-2.5 text-[13.5px]" style={{ color: used.length ? '#0A5F52' : '#8A5A06' }}>
                        <span className="block truncate" title={used.join(' · ') || 'Not used yet'}>
                          {used.length ? used.join(' · ') : 'Not used yet'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">{actions(m)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          title={`Delete ${confirm.file_name}?`}
          body="The photo is removed from storage. If it is still used by a doctor, facility or event, that record will lose its image."
          confirmLabel="Delete photo"
          tone="danger"
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            setBusy(true);
            try {
              await removeMedia(confirm.id);
              setConfirm(null);
              setToast({ message: 'Photo deleted.', tone: 'ok' });
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
