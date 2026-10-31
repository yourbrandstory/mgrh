'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { ChangeEvent, ReactNode } from 'react';
import { useAdmin } from './AdminContext';
import {
  bg,
  blank,
  initials,
  PRESETS,
  rel,
  SING,
  titleOf,
  validate,
} from './format';
import * as S from './store';
import { DAYS } from './format';
import { Sel } from './ui';
import { useRecordActions } from './useRecordActions';
import type {
  Collection,
  Doctor,
  EventRecord,
  Facility,
  GalleryItem,
  MediaTarget,
  RecordItem,
  SubItem,
} from './types';
import styles from './admin.module.css';

type FieldKind = 'text' | 'number' | 'date' | 'time' | 'area' | 'select' | 'check' | 'days';

interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  req?: boolean;
  ph?: string;
  hint?: string;
  wide?: boolean;
  checkLabel?: string;
  rows?: number;
}

interface Section {
  title: string;
  fields: FieldDef[];
}

const KEYMAP: Record<Collection, string> = { doctors: 'doc', facilities: 'fac', events: 'evt' };

export function RecordForm({ type }: { type: Collection }) {
  const admin = useAdmin();
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const routeId = typeof params?.id === 'string' ? params.id : null;
  const actions = useRecordActions();

  const [draft, setDraft] = useState<RecordItem | null>(null);
  const [draftOrig, setDraftOrig] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loadedKey, setLoadedKey] = useState<string>('');

  const loadKey = type + ':' + (routeId || 'new');
  useEffect(() => {
    if (loadedKey === loadKey) return;
    const db = admin.db;
    if (routeId) {
      const rec = db[type].find((r) => r.id === routeId);
      if (!rec) {
        admin.toast('That record no longer exists.', 'err');
        router.replace('/admin/' + type);
        return;
      }
      const d = JSON.parse(JSON.stringify(rec)) as RecordItem;
      setDraft(d);
      setDraftOrig(JSON.stringify(d));
      setErrors({});
      setLoadedKey(loadKey);
    } else {
      const d = JSON.parse(JSON.stringify(blank(type, db))) as RecordItem;
      setDraft(d);
      setDraftOrig(JSON.stringify(d));
      setErrors({});
      setLoadedKey(loadKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadKey]);

  const dirty = !!draft && JSON.stringify(draft) !== draftOrig;
  useEffect(() => {
    admin.setDirty(dirty);
  }, [dirty, admin]);

  useEffect(() => {
    return () => admin.setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDraftKey = useCallback((key: string, value: unknown) => {
    setDraft((prev) => (prev ? ({ ...prev, [key]: value } as RecordItem) : prev));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }, []);

  const singleAssign = useCallback(
    (mediaId: string) => {
      setDraft((prev) => {
        if (!prev) return prev;
        if (type === 'doctors') {
          const d = prev as Doctor;
          return { ...d, imageId: mediaId, imageAlt: d.imageAlt || 'Portrait of ' + (d.name || 'the doctor') };
        }
        const e = prev as EventRecord;
        return { ...e, coverId: mediaId, coverAlt: e.coverAlt || e.title || '' };
      });
    },
    [type],
  );

  const galleryAssign = useCallback(
    (index?: number) => (mediaId: string) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const key = type === 'facilities' ? 'images' : 'gallery';
        const d = prev as Facility & EventRecord;
        const arr = (((d as unknown as Record<string, GalleryItem[]>)[key]) || []).slice();
        if (index != null && arr[index]) arr[index] = { ...arr[index], mediaId };
        else arr.push({ mediaId, caption: '', alt: '' });
        return { ...d, [key]: arr } as RecordItem;
      });
    },
    [type],
  );

  const galleryOp = useCallback(
    (op: 'up' | 'down' | 'remove' | 'caption' | 'alt' | 'cover', i: number, val?: string) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const key = type === 'facilities' ? 'images' : 'gallery';
        const d = prev as Facility & EventRecord;
        const arr = (((d as unknown as Record<string, GalleryItem[]>)[key]) || []).slice();
        let cover = (d as Facility).coverIndex || 0;
        if (op === 'up' && i > 0) {
          [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          if (cover === i) cover--;
          else if (cover === i - 1) cover++;
        }
        if (op === 'down' && i < arr.length - 1) {
          [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
          if (cover === i) cover++;
          else if (cover === i + 1) cover--;
        }
        if (op === 'remove') {
          arr.splice(i, 1);
          if (cover >= arr.length) cover = Math.max(0, arr.length - 1);
        }
        if (op === 'caption' || op === 'alt') arr[i] = { ...arr[i], [op]: val || '' };
        if (op === 'cover') {
          if (key === 'images') cover = i;
          else return { ...d, coverId: arr[i].mediaId } as RecordItem;
        }
        return { ...d, [key]: arr, coverIndex: key === 'images' ? cover : d.coverIndex } as RecordItem;
      });
    },
    [type],
  );

  const setSub = useCallback(
    (index: number, patch: Partial<SubItem>) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const f = prev as Facility;
        return { ...f, subitems: (f.subitems || []).map((x, j) => (j === index ? { ...x, ...patch } : x)) } as RecordItem;
      });
    },
    [],
  );

  const addSub = () => {
    setDraft((prev) => (prev ? ({ ...(prev as Facility), subitems: ((prev as Facility).subitems || []).concat([{ name: '', text: '' }]) } as RecordItem) : prev));
  };
  const removeSub = (index: number) => {
    setDraft((prev) => (prev ? ({ ...(prev as Facility), subitems: ((prev as Facility).subitems || []).filter((_, j) => j !== index) } as RecordItem) : prev));
  };

  if (!draft) return null;

  const d = draft as unknown as Record<string, unknown>;
  const facility = draft as Facility;
  const event = draft as EventRecord;
  const doctor = draft as Doctor;
  const cats = admin.db.categories[type];
  const isNew = !routeId;
  const errs = errors;

  const fld = (key: string, label: string, kind: FieldKind, x: { req?: boolean; ph?: string; hint?: string; wide?: boolean; checkLabel?: string; rows?: number } = {}): FieldDef => ({
    key,
    label,
    kind,
    ...x,
  });

  const sections: Section[] = type === 'doctors'
    ? [
        { title: 'Basic information', fields: [fld('name', 'Full name', 'text', { req: true, ph: 'e.g. Dr. Anjali Patil', wide: true }), fld('designation', 'Designation', 'text', { ph: 'e.g. Medical Officer' }), fld('speciality', 'Speciality', 'select', { req: true }), fld('qualifications', 'Qualifications', 'text', { ph: 'e.g. M.B.B.S., M.D. (Medicine)' }), fld('experience', 'Years of experience', 'text', { ph: 'e.g. 12 years' }), fld('bio', 'Short introduction', 'area', { wide: true, hint: 'One or two sentences. Kept short on the website.' })] },
        { title: 'Consultation', fields: [fld('schedule', 'Schedule as shown on the website', 'text', { wide: true, ph: 'e.g. OPD, Monday to Saturday, 9:00 – 13:00' }), fld('days', 'Consultation days', 'days', { wide: true }), fld('start', 'Start time', 'time'), fld('end', 'End time', 'time'), fld('location', 'Location in the hospital', 'text', { wide: true, ph: 'e.g. OPD block, first floor' })] },
        { title: 'Contact & display', fields: [fld('contact', 'Contact details', 'text', { ph: 'Only if approved for public display' }), fld('order', 'Display order', 'number', { hint: 'Lower numbers appear first.' }), fld('showContact', '', 'check', { checkLabel: 'Contact details are approved to show on the website', wide: true })] },
      ]
    : type === 'facilities'
      ? [
          { title: 'Facility details', fields: [fld('name', 'Facility name', 'text', { req: true, wide: true }), fld('category', 'Section on the Facilities page', 'select', { req: true }), fld('subcategory', 'Sub-category (optional)', 'text'), fld('short', 'Short description', 'area', { wide: true, rows: 3, hint: 'Shown next to the photos on the Facilities page.' }), fld('full', 'Full description', 'area', { wide: true, rows: 5 }), fld('order', 'Display order', 'number', { hint: 'Order within the website.' })] },
        ]
      : [
          { title: 'Event details', fields: [fld('title', 'Event title', 'text', { req: true, wide: true }), fld('category', 'Category', 'select', { req: true }), fld('venue', 'Venue or location', 'text'), fld('date', 'Event date', 'date'), fld('endDate', 'End date (optional)', 'date'), fld('start', 'Start time (optional)', 'time'), fld('end', 'End time (optional)', 'time'), fld('organiser', 'Organiser or department (optional)', 'text', { wide: true })] },
          { title: 'Description', fields: [fld('summary', 'Short summary', 'area', { wide: true, rows: 3, hint: 'Shown on the event card.' }), fld('description', 'Full description', 'area', { wide: true, rows: 5 }), fld('highlights', 'Outcome or highlights (optional)', 'area', { wide: true, rows: 3 }), fld('order', 'Display order', 'number')] },
        ];

  const canPub = admin.can('publish');
  const p = draft.status === 'published' ? { label: 'Published', bg: '#E1F3EF', color: '#0A5F52' } : { label: 'Draft', bg: '#FDF3E1', color: '#8A5A06' };
  const isPublished = draft.status === 'published' && !isNew;
  const isDraftState = draft.status !== 'published' || isNew;
  const hasSingle = type !== 'facilities';
  const hasGallery = type !== 'doctors';
  const savedLine = isNew ? 'This record hasn’t been saved yet.' : 'Last saved ' + rel(draft.updatedAt) + (draft.updatedBy ? ' by ' + draft.updatedBy : '');
  const fmTitle = titleOf(draft) === 'Untitled' ? (isNew ? 'New ' + SING[type].toLowerCase() : 'Untitled') : titleOf(draft);

  const saveRecord = (mode: 'draft' | 'publish' | 'keep' | 'unpublish') => {
    const current = draft;
    const errList = validate(type, current as unknown as Record<string, unknown>);
    if (Object.keys(errList).length) {
      setErrors(errList);
      admin.toast('Some required details are missing. Check the fields marked in red.', 'err');
      return;
    }
    if ((mode === 'publish' || mode === 'unpublish') && !admin.can('publish')) {
      admin.toast('Your role can save drafts but not publish. Ask an administrator to publish this.', 'err');
      return;
    }
    const status = mode === 'publish' ? 'published' : mode === 'keep' ? current.status : 'draft';
    setSaving(mode);
    setTimeout(() => {
      const t = S.now();
      const id = routeId || S.uid(KEYMAP[type]);
      const rec = { ...current, id, status, updatedAt: t, updatedBy: admin.user ? admin.user.name : 'Admin', createdAt: current.createdAt || t } as RecordItem;
      if (type === 'facilities') (rec as Facility).review = !String((rec as Facility).short || '').trim();
      const action = !routeId ? 'Added' : mode === 'publish' && current.status !== 'published' ? 'Published' : mode === 'unpublish' ? 'Unpublished' : 'Updated';
      const ok = admin.persist(
        (db) => {
          const a = db[type] as RecordItem[];
          const i = a.findIndex((r) => r.id === id);
          if (i >= 0) a[i] = rec;
          else a.push(rec);
        },
        { action, type: SING[type], title: titleOf(rec) },
      );
      if (!ok) {
        setSaving(null);
        return;
      }
      setSaving(null);
      setDraft(rec);
      setDraftOrig(JSON.stringify(rec));
      admin.toast(
        status === 'published'
          ? mode === 'keep'
            ? 'Changes saved and live on the website.'
            : 'Published. It is now visible on the website.'
          : mode === 'unpublish'
            ? 'Unpublished. It has been removed from the website.'
            : 'Draft saved. It is not visible on the website yet.',
      );
      if (!routeId) router.replace('/admin/' + type + '/' + id);
    }, 420);
  };

  const singleKind = type === 'doctors' ? 'doctor' : 'cover';
  const singlePreset = type === 'doctors' ? 'doctor' : 'event';
  const singleSrc = type === 'doctors'
    ? (() => { const m = admin.db.media.find((x) => x.id === doctor.imageId); return m ? m.dataUrl || m.src || '' : ''; })()
    : (() => { const m = admin.db.media.find((x) => x.id === event.coverId); return m ? m.dataUrl || m.src || '' : ''; })();
  const singlePr = PRESETS[singlePreset as 'doctor' | 'event'];

  const galleryKey = type === 'facilities' ? 'images' : 'gallery';
  const gallery: GalleryItem[] = type === 'facilities' ? facility.images || [] : event.gallery || [];
  const glCount = gallery.length + (gallery.length === 1 ? ' image' : ' images');
  const glNote = type === 'events' && event.shotLabels && !gallery.length
    ? 'The website shows ' + event.shotLabels + ' empty photo slots for this event until images are added.'
    : '';

  const msrc = (id: string | null | undefined) => {
    const m = admin.db.media.find((x) => x.id === id);
    return m ? m.dataUrl || m.src || '' : '';
  };

  const galleryTarget = (index?: number): MediaTarget => ({
    kind: 'gallery',
    index,
    preset: type === 'events' ? 'event' : 'facility',
    assign: galleryAssign(index),
  });

  const renderField = (f: FieldDef): ReactNode => {
    const value = d[f.key];
    const border = errs[f.key] ? '#E1332A' : '#D5E2DE';
    const label = (
      <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 7 }}>
        {f.label}
        {f.req ? <span style={{ color: '#C42A21' }}> *</span> : null}
      </label>
    );
    return (
      <div key={f.key} style={{ gridColumn: f.wide ? '1 / -1' : 'auto', minWidth: 0 }}>
        {label}
        {['text', 'number', 'date', 'time'].includes(f.kind) ? (
          <input
            type={f.kind}
            value={value == null ? '' : String(value)}
            onChange={(e) => {
              const v = e.target.value;
              setDraftKey(f.key, f.kind === 'number' ? (v === '' ? '' : Number(v)) : v);
            }}
            placeholder={f.ph || ''}
            style={{ width: '100%', height: 46, padding: '0 13px', border: '1px solid ' + border, borderRadius: 8, fontSize: 16, color: '#16413A', background: '#ffffff' }}
          />
        ) : null}
        {f.kind === 'area' ? (
          <textarea
            value={value == null ? '' : String(value)}
            onChange={(e) => setDraftKey(f.key, e.target.value)}
            rows={f.rows || 4}
            placeholder={f.ph || ''}
            style={{ width: '100%', padding: '11px 13px', border: '1px solid ' + border, borderRadius: 8, fontSize: 16, lineHeight: 1.55, color: '#16413A', background: '#ffffff', resize: 'vertical' }}
          />
        ) : null}
        {f.kind === 'select' ? (
          <Sel
            value={String(value || '')}
            options={[{ value: '', label: 'Choose…' }].concat(cats.map((c) => ({ value: c, label: c })))}
            onChange={(e) => setDraftKey(f.key, e.target.value)}
            extra={{ width: '100%', borderColor: errs[f.key] ? '#E1332A' : '#D5E2DE' }}
          />
        ) : null}
        {f.kind === 'check' ? (
          <label style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15.5, color: '#23423B', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!value} onChange={(e) => setDraftKey(f.key, e.target.checked)} style={{ width: 20, height: 20, accentColor: '#0A8E7B' }} />
            {f.checkLabel || ''}
          </label>
        ) : null}
        {f.kind === 'days' ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DAYS.map((dd) => {
              const arr = (value as string[]) || [];
              const on = arr.includes(dd);
              return (
                <button
                  key={dd}
                  type="button"
                  onClick={() => setDraftKey(f.key, on ? arr.filter((x) => x !== dd) : DAYS.filter((x) => arr.includes(x) || x === dd))}
                  style={{ height: 40, minWidth: 56, padding: '0 12px', border: '1px solid ' + (on ? '#0A8E7B' : '#D5E2DE'), borderRadius: 8, background: on ? '#0A8E7B' : '#fff', color: on ? '#fff' : '#35514B', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
                >
                  {dd}
                </button>
              );
            })}
          </div>
        ) : null}
        {f.hint ? <div style={{ fontSize: 13.5, color: '#7A8C87', marginTop: 6 }}>{f.hint}</div> : null}
        {errs[f.key] ? <div role="alert" style={{ fontSize: 14, color: '#B4251E', marginTop: 6 }}>{errs[f.key]}</div> : null}
      </div>
    );
  };

  return (
    <>
      <button type="button" onClick={() => admin.guard(() => router.push('/admin/' + type))} style={{ border: 'none', background: 'none', padding: 0, color: '#0A8E7B', fontSize: 15.5, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>{'← All ' + type}</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
        <h2 style={{ fontWeight: 600, fontSize: 28, margin: 0, color: '#0B3C49' }}>{fmTitle}</h2>
        <span style={{ background: isNew ? '#EEF3F1' : p.bg, color: isNew ? '#5A6A66' : p.color, fontSize: 13.5, fontWeight: 600, padding: '5px 12px', borderRadius: 999 }}>{isNew ? 'Not saved yet' : p.label}</span>
        {dirty ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 14.5, color: '#8A5A06' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E3A21A' }} />Unsaved changes</span>
        ) : null}
      </div>
      {type === 'facilities' && facility.review ? (
        <div style={{ background: '#FFFBF2', border: '1px solid #F3E2B8', borderRadius: 10, padding: '14px 18px', fontSize: 15.5, lineHeight: 1.5, color: '#7A5205', marginBottom: 18 }}>The original website had no description for this facility. Add one confirmed by the hospital before publishing changes.</div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
          {sections.map((sec) => (
            <section key={sec.title} style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '22px 24px 24px' }}>
              <h3 style={{ fontWeight: 600, fontSize: 18.5, margin: '0 0 18px', color: '#0B3C49' }}>{sec.title}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px 20px' }}>
                {sec.fields.map(renderField)}
              </div>
            </section>
          ))}

          {type === 'facilities' ? (
            <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '22px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
                <h3 style={{ fontWeight: 600, fontSize: 18.5, margin: 0, color: '#0B3C49' }}>Sub-facilities</h3>
                <button type="button" onClick={addSub} style={{ border: 'none', background: 'none', color: '#0A8E7B', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>+ Add sub-facility</button>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 14.5, color: '#7A8C87' }}>For facilities with several services under one heading, such as Radiology (X-Ray, 2D Echo, Sonography).</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(facility.subitems || []).map((sb, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr) auto', gap: 12, alignItems: 'start', padding: 14, background: '#F7FAF9', border: '1px solid #EEF3F1', borderRadius: 10 }}>
                    <input type="text" value={sb.name} onChange={(e) => setSub(i, { name: e.target.value })} placeholder="Name, e.g. X-Ray" style={{ height: 44, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15.5, color: '#16413A' }} />
                    <textarea value={sb.text} onChange={(e) => setSub(i, { text: e.target.value })} rows={2} placeholder="Description" style={{ padding: '10px 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15.5, lineHeight: 1.5, color: '#16413A', resize: 'vertical' }} />
                    <button type="button" onClick={() => removeSub(i)} style={{ height: 44, padding: '0 12px', border: '1px solid #F0D2CF', borderRadius: 8, background: '#ffffff', color: '#B4251E', fontSize: 14, cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasGallery ? (
            <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '22px 24px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 6 }}>
                <h3 style={{ fontWeight: 600, fontSize: 18.5, margin: 0, color: '#0B3C49' }}>{type === 'facilities' ? 'Photos' : 'Gallery'} <span style={{ fontWeight: 500, fontSize: 15, color: '#7A8C87' }}>· {glCount}</span></h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => admin.setPreview({ type, rec: draft })} style={{ height: 40, padding: '0 14px', border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 14.5, cursor: 'pointer' }}>Preview gallery</button>
                  <button type="button" onClick={() => admin.setPicker({ target: galleryTarget() })} style={{ height: 40, padding: '0 14px', border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Choose from library</button>
                  <button type="button" onClick={() => admin.pickFile(galleryTarget(), true)} style={{ height: 40, padding: '0 16px', border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 14.5, fontWeight: 600, cursor: 'pointer' }}>Upload images</button>
                </div>
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 14, color: '#7A8C87' }}>Recommended 1200 × 900 px · 4:3 · Larger or smaller photos are fine — you’ll crop them to fit. You can select several files at once.</p>
              {glNote ? (
                <div style={{ background: '#F1F8F6', border: '1px solid #E1F3EF', borderRadius: 8, padding: '12px 14px', fontSize: 14.5, color: '#45605A', marginBottom: 14 }}>{glNote}</div>
              ) : null}
              {!gallery.length ? (
                <button type="button" onClick={() => admin.pickFile(galleryTarget(), true)} className={styles.hoverTealBoth} style={{ width: '100%', padding: '40px 20px', border: '2px dashed #C9DAD5', borderRadius: 12, background: '#F7FAF9', color: '#5A6A66', fontSize: 16, cursor: 'pointer' }}>No photos yet. Click to upload.</button>
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {gallery.map((g, i) => {
                  const isCover = type === 'facilities' ? (facility.coverIndex || 0) === i : event.coverId === g.mediaId;
                  const img = msrc(g.mediaId);
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr) auto', gap: 16, alignItems: 'start', padding: 12, border: '1px solid #E2ECE9', borderRadius: 10, background: '#ffffff' }}>
                      <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 8, backgroundColor: '#EEF3F1', backgroundImage: bg(img), backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        {isCover ? <span style={{ position: 'absolute', left: 6, top: 6, background: '#0A8E7B', color: '#ffffff', fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>Main photo</span> : null}
                        {!img ? <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, color: '#B4251E', textAlign: 'center', padding: 6 }}>Image missing from library</span> : null}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                        <input type="text" value={g.caption || ''} onChange={(e) => galleryOp('caption', i, e.target.value)} placeholder="Caption, e.g. General view" style={{ height: 40, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15, color: '#16413A' }} />
                        <input type="text" value={g.alt || ''} onChange={(e) => galleryOp('alt', i, e.target.value)} placeholder="Alternative text for screen readers" style={{ height: 40, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15, color: '#16413A' }} />
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {!isCover ? (
                            <button type="button" onClick={() => galleryOp('cover', i)} style={{ height: 32, padding: '0 10px', border: '1px solid #9FD0C7', borderRadius: 7, background: '#ffffff', color: '#0B5F55', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>{type === 'facilities' ? 'Set as main photo' : 'Use as cover'}</button>
                          ) : null}
                          <button type="button" onClick={() => admin.editMedia(g.mediaId, galleryTarget(i))} style={{ height: 32, padding: '0 10px', border: '1px solid #D5E2DE', borderRadius: 7, background: '#ffffff', color: '#35514B', fontSize: 13.5, cursor: 'pointer' }}>Adjust crop</button>
                          <button type="button" onClick={() => admin.pickFile(galleryTarget(i), false)} style={{ height: 32, padding: '0 10px', border: '1px solid #D5E2DE', borderRadius: 7, background: '#ffffff', color: '#35514B', fontSize: 13.5, cursor: 'pointer' }}>Replace</button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
                        <button type="button" onClick={() => galleryOp('up', i)} aria-label="Move earlier" style={{ height: 32, width: 40, border: '1px solid #E2ECE9', borderRadius: 7, background: '#ffffff', color: '#35514B', cursor: 'pointer' }}>▲</button>
                        <button type="button" onClick={() => galleryOp('down', i)} aria-label="Move later" style={{ height: 32, width: 40, border: '1px solid #E2ECE9', borderRadius: 7, background: '#ffffff', color: '#35514B', cursor: 'pointer' }}>▼</button>
                        <button type="button" onClick={() => galleryOp('remove', i)} aria-label="Remove from gallery" style={{ height: 32, width: 40, border: '1px solid #F0D2CF', borderRadius: 7, background: '#ffffff', color: '#B4251E', cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '20px 22px 22px' }}>
            <h3 style={{ fontWeight: 600, fontSize: 18, margin: '0 0 6px', color: '#0B3C49' }}>Publishing</h3>
            <p style={{ margin: '0 0 16px', fontSize: 14.5, color: '#7A8C87' }}>{savedLine}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {isDraftState ? (
                <>
                  <button type="button" onClick={() => saveRecord('publish')} className={styles.hoverBgDark} style={{ height: 48, border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 16.5, fontWeight: 700, cursor: 'pointer', opacity: canPub ? 1 : 0.45 }}>{saving === 'publish' ? 'Publishing…' : 'Publish'}</button>
                  <button type="button" onClick={() => saveRecord('draft')} style={{ height: 46, border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>{saving === 'draft' ? 'Saving…' : 'Save draft'}</button>
                </>
              ) : null}
              {isPublished ? (
                <>
                  <button type="button" onClick={() => saveRecord('keep')} className={styles.hoverBgDark} style={{ height: 48, border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 16.5, fontWeight: 700, cursor: 'pointer' }}>{saving === 'keep' ? 'Saving…' : 'Save changes'}</button>
                  <button type="button" onClick={() => saveRecord('unpublish')} style={{ height: 46, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 16, fontWeight: 600, cursor: 'pointer', opacity: canPub ? 1 : 0.45 }}>{saving === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}</button>
                </>
              ) : null}
              <button type="button" onClick={() => admin.setPreview({ type, rec: draft })} style={{ height: 44, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 15.5, cursor: 'pointer' }}>Preview</button>
            </div>
            {!canPub ? <p style={{ margin: '14px 0 0', fontSize: 14, lineHeight: 1.5, color: '#8A5A06' }}>Your role can save drafts. An administrator needs to publish.</p> : null}
            {!isNew && admin.can('delete') ? (
              <button type="button" onClick={() => actions.deleteRecord(type, routeId as string, () => router.replace('/admin/' + type))} style={{ marginTop: 16, border: 'none', background: 'none', padding: 0, color: '#B4251E', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Delete this record</button>
            ) : null}
          </section>

          {hasSingle ? (
            <section style={{ background: '#ffffff', border: '1px solid #E2ECE9', borderRadius: 12, padding: '20px 22px 22px' }}>
              <h3 style={{ fontWeight: 600, fontSize: 18, margin: '0 0 16px', color: '#0B3C49' }}>{type === 'doctors' ? 'Profile photo' : 'Cover image'}</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                {singleSrc ? (
                  <div style={{ width: type === 'doctors' ? '200px' : '100%', aspectRatio: type === 'doctors' ? '1 / 1' : '4 / 3', borderRadius: type === 'doctors' ? '50%' : 10, backgroundColor: '#EEF3F1', backgroundImage: bg(singleSrc), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                ) : (
                  <div style={{ width: type === 'doctors' ? '200px' : '100%', aspectRatio: type === 'doctors' ? '1 / 1' : '4 / 3', borderRadius: type === 'doctors' ? '50%' : 10, background: '#EEF3F1', border: '2px dashed #C9DAD5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A8C87', fontSize: 22, fontWeight: 700 }}>{type === 'doctors' ? (initials(doctor.name) || 'Photo') : 'No cover image'}</div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                <button type="button" onClick={() => admin.pickFile({ kind: singleKind, assign: singleAssign }, false)} style={{ height: 42, border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Upload image</button>
                <button type="button" onClick={() => admin.setPicker({ target: { kind: singleKind, assign: singleAssign } })} style={{ height: 42, border: '1px solid #9FD0C7', borderRadius: 8, background: '#ffffff', color: '#0B5F55', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>From library</button>
                {singleSrc ? (
                  <>
                    <button type="button" onClick={() => admin.editMedia(type === 'doctors' ? doctor.imageId : event.coverId, { kind: singleKind, assign: singleAssign })} style={{ height: 40, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 14.5, cursor: 'pointer' }}>Adjust crop</button>
                    <button type="button" onClick={() => setDraftKey(type === 'doctors' ? 'imageId' : 'coverId', null)} style={{ height: 40, border: '1px solid #F0D2CF', borderRadius: 8, background: '#ffffff', color: '#B4251E', fontSize: 14.5, cursor: 'pointer' }}>Remove</button>
                  </>
                ) : null}
              </div>
              <label style={{ display: 'block', fontSize: 14.5, fontWeight: 600, color: '#23423B', marginBottom: 6 }}>Alternative text</label>
              <input
                type="text"
                value={(type === 'doctors' ? doctor.imageAlt : event.coverAlt) || ''}
                onChange={(e) => setDraftKey(type === 'doctors' ? 'imageAlt' : 'coverAlt', e.target.value)}
                placeholder={type === 'doctors' ? 'e.g. Portrait of Dr. Anjali Patil' : 'Describe the photo for screen readers'}
                style={{ width: '100%', height: 42, padding: '0 12px', border: '1px solid #D5E2DE', borderRadius: 8, fontSize: 15, color: '#16413A' }}
              />
              <p style={{ margin: '12px 0 0', fontSize: 13.5, lineHeight: 1.5, color: '#7A8C87' }}>{'Recommended ' + singlePr.w + ' × ' + singlePr.h + ' px · ' + singlePr.ratio + ' · JPG, PNG or WebP · up to 5 MB'}</p>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
