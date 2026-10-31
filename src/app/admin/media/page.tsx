'use client';

import { useState } from 'react';
import { useAdmin } from '@/lib/admin/AdminContext';
import { bg, fmtDate, kb, usage } from '@/lib/admin/format';
import { Sel } from '@/lib/admin/ui';
import { useRecordActions } from '@/lib/admin/useRecordActions';
import * as S from '@/lib/admin/store';
import type { MediaItem } from '@/lib/admin/types';

const FILTERS = [
  { value: 'all', label: 'All images' },
  { value: 'doctors', label: 'Used by doctors' },
  { value: 'facilities', label: 'Used by facilities' },
  { value: 'events', label: 'Used by events' },
  { value: 'unused', label: 'Not used anywhere' },
];

export default function MediaPage() {
  const admin = useAdmin();
  const actions = useRecordActions();
  const [mediaQ, setMediaQ] = useState('');
  const [mediaFilter, setMediaFilter] = useState('all');
  const [mediaView, setMediaView] = useState<'grid' | 'list'>('grid');

  const db = admin.db;
  const q = mediaQ.trim().toLowerCase();
  const items = db.media
    .map((m) => ({ item: m, used: usage(db, m.id) }))
    .filter(({ item, used }) => {
      if (q && !item.name.toLowerCase().includes(q)) return false;
      if (mediaFilter === 'unused') return !used.length;
      if (mediaFilter !== 'all') return used.some((x) => x.type === mediaFilter);
      return true;
    });

  const usedLen = typeof window === 'undefined' ? 0 : (localStorage.getItem(S.KEY) || '').length;
  const storagePct = Math.min(100, Math.round(usedLen / 50000)) + '%';
  const storageText = kb(usedLen * 2) + ' of about 5 MB browser storage used';

  const isGrid = mediaView === 'grid';
  const isListMode = mediaView === 'list';
  const gridBtnBg = isGrid ? '#0A8E7B' : '#fff';
  const gridBtnColor = isGrid ? '#fff' : '#35514B';
  const listBtnBg = isListMode ? '#0A8E7B' : '#fff';
  const listBtnColor = isListMode ? '#fff' : '#35514B';

  const openPreview = (m: MediaItem) => admin.setPreview({ type: 'media', rec: m });

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <h2 style={{ fontWeight: 600, fontSize: 28, margin: 0, color: '#0B3C49' }}>Media Library</h2>
            <span style={{ fontSize: 15, color: '#7A8C87' }}>{items.length + ' of ' + db.media.length + ' images'}</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 16, color: '#5A6A66' }}>Every photo used on the website. Images in use can’t be deleted until they’re removed from their pages.</p>
        </div>
        <button type="button" onClick={() => admin.pickFile({ kind: 'library', preset: 'facility' }, true)} style={{ height: 46, padding: '0 22px', border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Upload images</button>
      </div>
      <div style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <input type="search" value={mediaQ} onChange={(e) => setMediaQ(e.target.value)} placeholder="Search by file name" style={{ flex: '1 1 260px', height: 44, padding: '0 14px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15.5, color: '#16413A' }} />
        <Sel value={mediaFilter} options={FILTERS} onChange={(e) => setMediaFilter(e.target.value)} />
        <div style={{ display: 'flex', border: '1px solid #D5E2DE', borderRadius: 8, overflow: 'hidden' }}>
          <button type="button" onClick={() => setMediaView('grid')} style={{ height: 42, padding: '0 16px', border: 'none', background: gridBtnBg, color: gridBtnColor, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Grid</button>
          <button type="button" onClick={() => setMediaView('list')} style={{ height: 42, padding: '0 16px', border: 'none', background: listBtnBg, color: listBtnColor, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>List</button>
        </div>
      </div>

      {isGrid ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 16 }}>
          {items.map(({ item: m, used }) => {
            const usageText = used.length ? used.map((x) => x.label + ': ' + x.title).join(' · ') : 'Not used yet';
            return (
              <div key={m.id} style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <button type="button" onClick={() => openPreview(m)} style={{ display: 'block', aspectRatio: '4 / 3', border: 'none', padding: 0, cursor: 'zoom-in', backgroundColor: '#EEF3F1', backgroundImage: bg(m.dataUrl || m.src), backgroundSize: 'cover', backgroundPosition: 'center' }} aria-label="Preview" />
                <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#16413A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: '#7A8C87' }}>{(m.width ? m.width + ' × ' + m.height + ' px' : 'Original size') + ' · ' + kb(m.size) + ' · ' + (m.type || '').replace('image/', '').toUpperCase()}</div>
                  <div style={{ fontSize: 13, color: used.length ? '#0A5F52' : '#8A5A06', lineHeight: 1.4, marginTop: 2 }}>{usageText}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 'auto', paddingTop: 10 }}>
                    <button type="button" onClick={() => actions.replaceMedia(m.id)} style={{ flex: 1, height: 34, border: '1px solid #D5E2DE', borderRadius: 7, background: '#ffffff', color: '#35514B', fontSize: 14, cursor: 'pointer' }}>Replace</button>
                    <button type="button" onClick={() => actions.deleteMedia(m.id)} style={{ flex: 1, height: 34, border: '1px solid #F0D2CF', borderRadius: 7, background: '#ffffff', color: '#B4251E', fontSize: 14, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {isListMode ? (
        <div style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, overflow: 'hidden' }}>
          {items.map(({ item: m, used }) => {
            const usageText = used.length ? used.map((x) => x.label + ': ' + x.title).join(' · ') : 'Not used yet';
            return (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '80px minmax(0, 1.3fr) 130px 80px 70px 110px minmax(0, 1.4fr) 180px', gap: 14, alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #F1F5F3', fontSize: 14.5, color: '#45605A' }}>
                <button type="button" onClick={() => openPreview(m)} aria-label="Preview" style={{ width: 80, aspectRatio: '4 / 3', border: 'none', borderRadius: 6, cursor: 'zoom-in', backgroundColor: '#EEF3F1', backgroundImage: bg(m.dataUrl || m.src), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <span style={{ fontWeight: 600, color: '#16413A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                <span>{m.width ? m.width + ' × ' + m.height + ' px' : 'Original size'}</span>
                <span>{kb(m.size)}</span>
                <span>{(m.type || '').replace('image/', '').toUpperCase()}</span>
                <span>{fmtDate(m.uploadedAt)}</span>
                <span style={{ color: used.length ? '#0A5F52' : '#8A5A06', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{usageText}</span>
                <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => actions.replaceMedia(m.id)} style={{ height: 32, padding: '0 10px', border: '1px solid #D5E2DE', borderRadius: 7, background: '#ffffff', color: '#35514B', fontSize: 13.5, cursor: 'pointer' }}>Replace</button>
                  <button type="button" onClick={() => actions.deleteMedia(m.id)} style={{ height: 32, padding: '0 10px', border: '1px solid #F0D2CF', borderRadius: 7, background: '#ffffff', color: '#B4251E', fontSize: 13.5, cursor: 'pointer' }}>Delete</button>
                </span>
              </div>
            );
          })}
        </div>
      ) : null}

      {!items.length ? (
        <div style={{ background: '#ffffff', border: '1px dashed #C9DAD5', borderRadius: 12, padding: '50px 30px', textAlign: 'center', fontSize: 16, color: '#5A6A66' }}>No images match. Try another search or filter.</div>
      ) : null}

      <div style={{ marginTop: 22, maxWidth: 520 }}>
        <div style={{ height: 8, borderRadius: 999, background: '#E2ECE9', overflow: 'hidden' }}><div style={{ height: '100%', width: storagePct, background: '#0A8E7B' }} /></div>
        <div style={{ fontSize: 13.5, color: '#7A8C87', marginTop: 7 }}>{storageText} (prototype storage — the production CMS stores images on the server)</div>
      </div>
    </>
  );
}
