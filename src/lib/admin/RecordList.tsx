'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from './AdminContext';
import { bg, fmtDate, initials, rel, SING, titleOf, pill } from './format';
import { Sel } from './ui';
import { useRecordActions } from './useRecordActions';
import type { Collection, Doctor, EventRecord, Facility, RecordItem } from './types';
import styles from './admin.module.css';

const LIST_TITLE: Record<Collection, string> = { doctors: 'Doctors', facilities: 'Facilities', events: 'Events' };
const LIST_SUB: Record<Collection, string> = {
  doctors: 'Doctors shown on the public Doctors page.',
  facilities: 'Departments and services shown on the Facilities page, grouped by section.',
  events: 'Camps, drives and awareness events shown on the Camps & Events page.',
};
const COLS: Record<Collection, string[]> = {
  doctors: ['Qualifications', 'Experience', 'Schedule', 'Location'],
  facilities: ['Section', 'Description', 'Images', 'Order'],
  events: ['Date', 'Category', 'Venue', 'Photos'],
};

export function RecordList({ type }: { type: Collection }) {
  const admin = useAdmin();
  const router = useRouter();
  const actions = useRecordActions();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('order');
  const [dateF, setDateF] = useState('all');
  const [menuFor, setMenuFor] = useState('');

  useEffect(() => {
    if (!menuFor) return;
    const close = () => setMenuFor('');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuFor('');
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuFor]);

  const db = admin.db;
  const cats = db.categories[type];
  const needle = q.trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);
  const msrc = (id: string | null | undefined) => {
    const m = db.media.find((x) => x.id === id);
    return m ? m.dataUrl || m.src || '' : '';
  };

  const searched = db[type].filter((r) => {
    const rec = r as Doctor & Facility & EventRecord;
    if (needle && !titleOf(r).toLowerCase().includes(needle) && !(rec.designation || rec.venue || '').toLowerCase().includes(needle)) return false;
    const c = type === 'doctors' ? (r as Doctor).speciality : (r as Facility | EventRecord).category;
    if (filter !== 'all' && c !== filter) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (type === 'events' && dateF !== 'all') {
      const date = (r as EventRecord).date;
      if (dateF === 'upcoming' && !(date >= today)) return false;
      if (dateF === 'past' && !(date && date < today)) return false;
      if (/^\d{4}$/.test(dateF) && !(date || '').startsWith(dateF)) return false;
    }
    return true;
  });

  const sorters: Record<string, (a: RecordItem, b: RecordItem) => number> = {
    order: (a, b) => a.order - b.order,
    name: (a, b) => titleOf(a).localeCompare(titleOf(b)),
    updated: (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''),
    dateDesc: (a, b) => ((b as EventRecord).date || '').localeCompare((a as EventRecord).date || ''),
    dateAsc: (a, b) => ((a as EventRecord).date || '9').localeCompare((b as EventRecord).date || '9'),
  };
  const rows = searched.slice().sort(sorters[sort] || sorters.order);

  const filtered = !!needle || filter !== 'all' || status !== 'all' || dateF !== 'all';
  const years = Array.from(new Set(db.events.map((e) => (e.date || '').slice(0, 4)).filter(Boolean))).sort().reverse();
  const sortOpts = [
    { value: 'order', label: 'Display order' },
    { value: 'name', label: 'Name A–Z' },
    { value: 'updated', label: 'Last updated' },
  ].concat(type === 'events' ? [{ value: 'dateDesc', label: 'Date, newest first' }, { value: 'dateAsc', label: 'Date, oldest first' }] : []);
  const canPub = admin.can('publish');
  const canDel = admin.can('delete');
  const addLabel = 'Add ' + SING[type].toLowerCase();

  const clearFilters = () => {
    setQ('');
    setFilter('all');
    setStatus('all');
    setDateF('all');
  };

  return (
    <>
      <div className={styles.listHeader} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h2 className={styles.listTitle} style={{ fontWeight: 600, fontSize: 28, margin: 0, color: '#0B3C49' }}>{LIST_TITLE[type]}</h2>
            <span className={styles.listCount} style={{ fontSize: 15, color: '#7A8C87' }}>{rows.length === db[type].length ? db[type].length + ' total' : rows.length + ' of ' + db[type].length}</span>
          </div>
          <p className={styles.listSub} style={{ margin: '6px 0 0', fontSize: 16, color: '#5A6A66' }}>{LIST_SUB[type]}</p>
        </div>
        <button
          type="button"
          onClick={() => admin.guard(() => router.push('/admin/' + type + '/new'))}
          className={styles.hoverBgDark + ' ' + styles.addBtn}
          style={{ height: 46, padding: '0 22px', border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
        >
          + {addLabel}
        </button>
      </div>

      <div className={styles.toolbar} style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <input
          type="search"
          className={styles.toolSearch}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={'Search by ' + (type === 'doctors' ? 'name or designation' : type === 'events' ? 'title or venue' : 'name')}
          style={{ flex: '1 1 260px', height: 44, padding: '0 14px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15.5, color: '#16413A' }}
        />
        <div className={styles.filterRow}>
          <Sel
            value={filter}
            options={[{ value: 'all', label: type === 'doctors' ? 'All specialities' : type === 'facilities' ? 'All sections' : 'All categories' }].concat(cats.map((c) => ({ value: c, label: c })))}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Sel
            value={status}
            options={[{ value: 'all', label: 'Any status' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
            onChange={(e) => setStatus(e.target.value)}
            extra={{ minWidth: 140 }}
          />
          {type === 'events' ? (
            <Sel
              value={dateF}
              options={[{ value: 'all', label: 'All dates' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }].concat(years.map((y) => ({ value: y, label: y })))}
              onChange={(e) => setDateF(e.target.value)}
              extra={{ minWidth: 140 }}
            />
          ) : null}
          <Sel value={sort} options={sortOpts} onChange={(e) => setSort(e.target.value)} extra={{ minWidth: 180 }} />
          {filtered ? (
            <button type="button" onClick={clearFilters} style={{ border: 'none', background: 'none', color: '#0A8E7B', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '0 6px', whiteSpace: 'nowrap' }}>Clear filters</button>
          ) : null}
        </div>
      </div>

      {rows.length > 0 ? (
        <div className={styles.listWrap} style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, overflowX: 'auto' }}>
          <div className={styles.listInner} style={{ minWidth: 1120 }}>
            <div className={styles.listHead} style={{ display: 'grid', gridTemplateColumns: '40px minmax(240px, 1.6fr) repeat(4, minmax(100px, 1fr)) 120px 236px', gap: 14, padding: '12px 18px', borderBottom: '1px solid #E2ECE9', background: '#F7FAF9', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#5A6A66' }}>
              <span>Order</span>
              <span>Name</span>
              {COLS[type].map((c) => <span key={c}>{c}</span>)}
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>
            {rows.map((r, i) => {
              const rec = r as Doctor & Facility & EventRecord;
              const p = pill(r.status);
              const img = type === 'doctors'
                ? msrc((r as Doctor).imageId)
                : type === 'facilities'
                  ? msrc((((r as Facility).images || [])[(r as Facility).coverIndex || 0] || {}).mediaId)
                  : msrc((r as EventRecord).coverId || (((r as EventRecord).gallery || [])[0] || {}).mediaId);
              const cells = type === 'doctors'
                ? [(r as Doctor).qualifications || '—', (r as Doctor).experience || '—', (r as Doctor).schedule || '—', (r as Doctor).location || '—']
                : type === 'facilities'
                  ? [(r as Facility).category || '—', (r as Facility).short || 'No description yet', ((r as Facility).images || []).length + (((r as Facility).images || []).length === 1 ? ' image' : ' images'), '#' + r.order]
                  : [fmtDate((r as EventRecord).date), (r as EventRecord).category || '—', (r as EventRecord).venue || '—', ((r as EventRecord).gallery || []).length ? ((r as EventRecord).gallery || []).length + ' photos' : (r as EventRecord).shotLabels ? '0 · ' + (r as EventRecord).shotLabels + ' slots waiting' : '0'];
              const sub = type === 'doctors'
                ? [(r as Doctor).designation, (r as Doctor).speciality].filter(Boolean).join(' · ')
                : type === 'facilities'
                  ? (((r as Facility).subitems || []).length ? ((r as Facility).subitems || []).length + ' sub-facilities' : '')
                  : (r as EventRecord).organiser || '';
              return (
                <div key={r.id} className={styles.listRow} style={{ display: 'grid', gridTemplateColumns: '40px minmax(240px, 1.6fr) repeat(4, minmax(100px, 1fr)) 120px 236px', gap: 14, alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid #F1F5F3', background: i % 2 ? '#FBFDFC' : '#ffffff' }}>
                  <div className={styles.orderCell} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button type="button" onClick={() => actions.move(type, r.id, -1)} aria-label="Move up" className={styles.hoverBorderTeal} style={{ height: 22, border: '1px solid #E2ECE9', borderRadius: 5, background: '#ffffff', color: '#35514B', fontSize: 11, cursor: 'pointer' }}>▲</button>
                    <button type="button" onClick={() => actions.move(type, r.id, 1)} aria-label="Move down" className={styles.hoverBorderTeal} style={{ height: 22, border: '1px solid #E2ECE9', borderRadius: 5, background: '#ffffff', color: '#35514B', fontSize: 11, cursor: 'pointer' }}>▼</button>
                  </div>
                  <button type="button" onClick={() => admin.guard(() => router.push('/admin/' + type + '/' + r.id))} className={styles.nameCell} style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
                    {img ? (
                      <span className={styles.listPhoto} style={{ flex: 'none', width: 52, height: 52, borderRadius: type === 'doctors' ? '50%' : 8, backgroundColor: '#EEF3F1', backgroundImage: bg(img), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    ) : (
                      <span className={styles.listPhoto} style={{ flex: 'none', width: 52, height: 52, borderRadius: type === 'doctors' ? '50%' : 8, background: '#EEF3F1', border: '1px dashed #C9DAD5', color: '#7A8C87', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{type === 'doctors' ? initials((r as Doctor).name) : '—'}</span>
                    )}
                    <span style={{ minWidth: 0 }}>
                      <span className={styles.nameText} style={{ display: 'block', fontSize: 16, fontWeight: 600, color: '#16413A', lineHeight: 1.3 }}>{titleOf(r)}</span>
                      <span className={styles.nameSub} style={{ display: 'block', fontSize: 13.5, color: '#7A8C87', marginTop: 2 }}>{sub}</span>
                      {rec.review ? <span style={{ display: 'inline-block', marginTop: 5, background: '#FFF4DC', color: '#7A5205', fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>Needs review</span> : null}
                    </span>
                  </button>
                  {cells.map((c, ci) => (
                    <span key={ci} className={styles.cellItem} style={{ fontSize: 14.5, lineHeight: 1.4, color: '#45605A', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c}</span>
                  ))}
                  <span className={styles.statusCell}>
                    <span style={{ display: 'inline-block', background: p.bg, color: p.color, fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>{p.label}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: '#7A8C87', marginTop: 5 }}>{rel(r.updatedAt)}</span>
                  </span>
                  <div className={styles.rowActions} style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => admin.guard(() => router.push('/admin/' + type + '/' + r.id))} className={styles.hoverBgDark} style={{ height: 34, padding: '0 12px', border: 'none', borderRadius: 7, background: '#0A8E7B', color: '#ffffff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    <button type="button" onClick={() => admin.setPreview({ type, rec: r })} className={styles.hoverBorderTeal} style={{ height: 34, padding: '0 10px', border: '1px solid #D5E2DE', borderRadius: 7, background: '#ffffff', color: '#35514B', fontSize: 14, cursor: 'pointer' }}>Preview</button>
                    <button type="button" onClick={() => actions.toggleStatus(type, r.id)} className={styles.hoverBorderTeal} style={{ height: 34, padding: '0 10px', border: '1px solid #D5E2DE', borderRadius: 7, background: '#ffffff', color: '#35514B', fontSize: 14, cursor: 'pointer', opacity: canPub ? 1 : 0.4 }}>{r.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                    <button type="button" onClick={() => actions.deleteRecord(type, r.id)} aria-label="Delete" className={styles.hoverBorderRed} style={{ height: 34, padding: '0 10px', border: '1px solid #F0D2CF', borderRadius: 7, background: '#ffffff', color: '#B4251E', fontSize: 14, cursor: 'pointer', opacity: canDel ? 1 : 0.4 }}>Delete</button>
                  </div>
                  <div className={styles.mobileTop}>
                    <span style={{ display: 'inline-block', background: p.bg, color: p.color, fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>{p.label}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMenuFor(menuFor === r.id ? '' : r.id);
                      }}
                      aria-label="More actions"
                      aria-expanded={menuFor === r.id}
                      className={styles.rowMenuBtn}
                    >
                      ⋯
                    </button>
                  </div>
                  {menuFor === r.id ? (
                    <div className={styles.mobileMenu}>
                      <button type="button" onClick={() => admin.guard(() => router.push('/admin/' + type + '/' + r.id))}>Edit</button>
                      <button type="button" onClick={() => admin.setPreview({ type, rec: r })}>Preview</button>
                      {canPub ? <button type="button" onClick={() => actions.toggleStatus(type, r.id)}>{r.status === 'published' ? 'Unpublish' : 'Publish'}</button> : null}
                      <button type="button" onClick={() => actions.move(type, r.id, -1)}>Move up</button>
                      <button type="button" onClick={() => actions.move(type, r.id, 1)}>Move down</button>
                      {canDel ? (
                        <button type="button" className={styles.menuDanger} onClick={() => actions.deleteRecord(type, r.id)}>Delete</button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {!db[type].length ? (
        <div style={{ background: '#ffffff', border: '1px dashed #C9DAD5', borderRadius: 12, padding: '60px 30px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 21, color: '#0B3C49', marginBottom: 8 }}>{'No ' + type + ' yet'}</div>
          <p style={{ margin: '0 0 20px', fontSize: 16, color: '#5A6A66' }}>{'Add the first ' + SING[type].toLowerCase() + ' and it will appear here.'}</p>
          <button type="button" onClick={() => admin.guard(() => router.push('/admin/' + type + '/new'))} style={{ height: 46, padding: '0 22px', border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>+ {addLabel}</button>
        </div>
      ) : null}

      {db[type].length > 0 && rows.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #C9DAD5', borderRadius: 12, padding: '50px 30px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 20, color: '#0B3C49', marginBottom: 8 }}>Nothing matches your search</div>
          <p style={{ margin: '0 0 18px', fontSize: 16, color: '#5A6A66' }}>Try a different spelling, or clear the filters to see everything.</p>
          <button type="button" onClick={clearFilters} style={{ height: 44, padding: '0 20px', border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 15.5, fontWeight: 600, cursor: 'pointer' }}>Clear filters</button>
        </div>
      ) : null}
    </>
  );
}
