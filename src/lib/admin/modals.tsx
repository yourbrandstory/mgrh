'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useAdmin } from './AdminContext';
import { bg, drawTo, fmtDate, initials, kb, MON, PRESETS } from './format';
import type { Doctor, EventRecord, Facility, MediaItem, RecordItem } from './types';
import styles from './admin.module.css';

function stop(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

export function AdminModals() {
  const admin = useAdmin();
  const { db, toastState, confirmState, preview, picker, editor, edSaving, queueCount } = admin;
  const msrc = (id: string | null | undefined) => {
    const m = db.media.find((x) => x.id === id);
    return m ? m.dataUrl || m.src || '' : '';
  };

  return (
    <>
      {editor ? <ImageEditor /> : null}
      {picker ? (
        <div
          onClick={() => admin.setPicker(null)}
          className={styles.modalOverlay}
          style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'rgba(8,30,28,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}
        >
          <div
            onClick={stop}
            role="dialog"
            aria-modal="true"
            className={styles.pickerCard}
            style={{ width: '100%', maxWidth: 920, maxHeight: 'calc(100vh - 56px)', overflow: 'auto', background: '#ffffff', borderRadius: 16, animation: 'cmsUp 0.24s ease' }}
          >
            <div style={{ padding: '20px 26px', borderBottom: '1px solid #EEF3F1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 600, fontSize: 21, margin: 0, color: '#0B3C49' }}>Choose from the Media Library</h3>
              <button type="button" onClick={() => admin.setPicker(null)} style={{ border: 'none', background: 'none', fontSize: 15.5, color: '#5A6A66', cursor: 'pointer' }}>Close</button>
            </div>
            <p style={{ margin: '16px 26px 0', fontSize: 14.5, color: '#7A8C87' }}>Pick an image, then adjust the crop for this use. The original stays unchanged.</p>
            <div className={styles.pickerGrid} style={{ padding: '18px 26px 26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              {db.media.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const target = picker.target;
                    admin.setPicker(null);
                    admin.editMedia(m.id, target);
                  }}
                  className={styles.hoverBorderTeal}
                  style={{ border: '1px solid #E2ECE9', borderRadius: 10, background: '#ffffff', padding: 0, overflow: 'hidden', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span style={{ display: 'block', aspectRatio: '4 / 3', backgroundColor: '#EEF3F1', backgroundImage: bg(m.dataUrl || m.src), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <span style={{ display: 'block', padding: '8px 10px', fontSize: 13.5, color: '#16413A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {preview ? <PreviewModal /> : null}
      {confirmState ? (
        <div
          onClick={admin.closeConfirm}
          className={styles.modalOverlay + ' ' + styles.confirmOverlay}
          style={{ position: 'fixed', inset: 0, zIndex: 260, background: 'rgba(8,30,28,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}
        >
          <div
            onClick={stop}
            role="alertdialog"
            aria-modal="true"
            className={styles.confirmCard}
            style={{ width: '100%', maxWidth: 500, background: '#ffffff', borderRadius: 14, padding: '26px 28px 24px', animation: 'cmsUp 0.22s ease' }}
          >
            <h3 style={{ fontWeight: 600, fontSize: 21, margin: '0 0 10px', color: '#0B3C49' }}>{confirmState.title}</h3>
            <p style={{ margin: '0 0 24px', fontSize: 16, lineHeight: 1.6, color: '#45605A' }}>{confirmState.body}</p>
            <div className={styles.confirmButtons} style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              {!confirmState.infoOnly ? (
                <button type="button" onClick={admin.closeConfirm} style={{ height: 44, padding: '0 18px', border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 15.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              ) : null}
              <button type="button" onClick={admin.confirmOk} style={{ height: 44, padding: '0 20px', border: 'none', borderRadius: 8, background: confirmState.danger ? '#C42A21' : '#0A8E7B', color: '#ffffff', fontSize: 15.5, fontWeight: 700, cursor: 'pointer' }}>{confirmState.confirmLabel}</button>
            </div>
          </div>
        </div>
      ) : null}
      {toastState ? (
        <div
          role="status"
          className={styles.toast}
          style={{ position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)', zIndex: 300, maxWidth: 640, background: toastState.kind === 'err' ? '#9E2018' : '#0B4F45', color: '#ffffff', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, fontSize: 15.5, lineHeight: 1.45, boxShadow: '0 20px 44px -18px rgba(0,0,0,0.45)', animation: 'cmsUp 0.24s ease' }}
        >
          <span>{toastState.msg}</span>
          <button type="button" onClick={admin.clearToast} aria-label="Dismiss" style={{ flex: 'none', border: 'none', background: 'transparent', color: '#ffffff', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
      ) : null}
    </>
  );
}

function PreviewModal() {
  const admin = useAdmin();
  const { db, preview } = admin;
  if (!preview) return null;
  const msrc = (id: string | null | undefined) => {
    const m = db.media.find((x) => x.id === id);
    return m ? m.dataUrl || m.src || '' : '';
  };
  const r = preview.rec;
  const pvDraft = preview.type !== 'media' && (r as RecordItem).status !== 'published';
  const pvIsDoc = preview.type === 'doctors';
  const pvIsFac = preview.type === 'facilities';
  const pvIsEvt = preview.type === 'events';
  const pvIsMedia = preview.type === 'media';

  const doc = pvIsDoc ? (r as Doctor) : null;
  const fac = pvIsFac ? (r as Facility) : null;
  const evt = pvIsEvt ? (r as EventRecord) : null;
  const media = pvIsMedia ? (r as MediaItem) : null;

  return (
    <div onClick={() => admin.setPreview(null)} className={styles.previewOverlay} style={{ position: 'fixed', inset: 0, zIndex: 180, background: 'rgba(8,30,28,0.55)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 28px', overflowY: 'auto' }}>
      <div onClick={stop} role="dialog" aria-modal="true" className={styles.previewCard + (pvIsMedia ? ' ' + styles.previewSheet : '')} style={{ width: '100%', maxWidth: 900, background: '#ffffff', borderRadius: 16, overflow: 'hidden', animation: 'cmsUp 0.24s ease' }}>
        {pvIsMedia ? <div className={styles.sheetHandle} aria-hidden="true"><span /></div> : null}
        <div style={{ padding: '14px 22px', background: '#0B4F45', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>Preview · how it looks on the website</span>
          <button type="button" onClick={() => admin.setPreview(null)} style={{ border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#ffffff', borderRadius: 7, padding: '6px 12px', fontSize: 14, cursor: 'pointer' }}>Close</button>
        </div>
        {pvDraft ? (
          <div style={{ background: '#FDF3E1', color: '#7A5205', padding: '10px 22px', fontSize: 14.5, fontWeight: 600 }}>Draft — this is not visible on the public website.</div>
        ) : null}
        <div className={styles.previewBody} style={{ padding: '34px 36px 38px', fontFamily: "'DM Sans', sans-serif" }}>
          {doc ? (
            <div className={styles.previewDocGrid} style={{ display: 'grid', gridTemplateColumns: '200px minmax(0, 1fr)', gap: 30, alignItems: 'start', border: '1px solid #E1EEEA', borderRadius: 14, padding: 28 }}>
              {msrc(doc.imageId) ? (
                <div style={{ width: 200, aspectRatio: '1 / 1', borderRadius: '50%', backgroundImage: bg(msrc(doc.imageId)), backgroundSize: 'cover', backgroundPosition: 'center' }} />
              ) : (
                <div style={{ width: 200, aspectRatio: '1 / 1', borderRadius: '50%', background: '#E1F3EF', color: '#0A5F52', fontSize: 48, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials(doc.name)}</div>
              )}
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 25, margin: '0 0 6px', color: '#12564C' }}>{doc.name || 'Untitled'}</h3>
                <div style={{ fontSize: 19, fontWeight: 600, color: '#0A5F52' }}>{doc.designation}</div>
                <div style={{ fontSize: 17, color: '#7A8C87', marginTop: 3 }}>{[doc.qualifications, doc.experience && doc.experience + ' experience'].filter(Boolean).join(' · ')}</div>
                <p style={{ margin: '16px 0 0', fontSize: 18, lineHeight: 1.56, color: '#4E5F5A' }}>{doc.bio}</p>
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #F1F5F3', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 17, color: '#5A6A66' }}>
                  <span>{doc.schedule || [(doc.days || []).join(', '), doc.start && doc.end ? doc.start + ' – ' + doc.end : ''].filter(Boolean).join(', ')}</span>
                  <span>{doc.location}</span>
                  {doc.showContact && doc.contact ? <span>{doc.contact}</span> : null}
                </div>
              </div>
            </div>
          ) : null}
          {fac ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0B7F73', marginBottom: 8 }}>{fac.category}</div>
              <h3 style={{ fontWeight: 600, fontSize: 27, margin: '0 0 10px', color: '#1F3A34' }}>{fac.name || 'Untitled'}</h3>
              <p style={{ margin: '0 0 10px', fontSize: 18, lineHeight: 1.6, color: '#4E5F5A' }}>{fac.short || 'No description yet.'}</p>
              {fac.full ? <p style={{ margin: '0 0 14px', fontSize: 17, lineHeight: 1.6, color: '#4E5F5A' }}>{fac.full}</p> : null}
              {(fac.subitems || []).filter((x) => x.name || x.text).map((ps, i) => (
                <p key={i} style={{ margin: '0 0 10px', fontSize: 17, lineHeight: 1.55, color: '#4E5F5A' }}><strong style={{ color: '#12564C' }}>{ps.name}:</strong> {ps.text}</p>
              ))}
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', marginTop: 18 }}>
                {(fac.images || []).map((g, i) => (
                  <div key={i} style={{ flex: 'none', width: 300 }}>
                    <div style={{ aspectRatio: '4 / 3', borderRadius: 8, backgroundColor: '#EEF3F1', backgroundImage: bg(msrc(g.mediaId)), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ fontSize: 14, color: '#5A6A66', marginTop: 7 }}>{g.caption}</div>
                  </div>
                ))}
              </div>
              {!(fac.images || []).length ? (
                <div style={{ marginTop: 18, aspectRatio: '16 / 6', borderRadius: 10, background: '#EEF3F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A8C87', fontSize: 15 }}>Photos will appear here</div>
              ) : null}
            </>
          ) : null}
          {evt ? (
            <>
              <div className={styles.previewEventGrid} style={{ display: 'grid', gridTemplateColumns: '300px minmax(0, 1fr)', gap: 26, alignItems: 'start', border: '1px solid #E6ECEA', borderRadius: 16, padding: 22 }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 10, backgroundColor: '#EEF3F1', backgroundImage: bg(msrc(evt.coverId || ((evt.gallery || [])[0] || {}).mediaId)), backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  {!msrc(evt.coverId || ((evt.gallery || [])[0] || {}).mediaId) ? (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A8C87', fontSize: 14.5 }}>No cover image</span>
                  ) : null}
                  <div style={{ position: 'absolute', left: 10, top: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 9, padding: '6px 9px 7px', textAlign: 'center', minWidth: 48 }}>
                    <div style={{ fontWeight: 700, fontSize: 18, lineHeight: 1, color: '#12564C' }}>{evt.date ? new Date(evt.date + 'T00:00:00').getDate() : '—'}</div>
                    <div style={{ fontWeight: 600, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E1332A', marginTop: 3 }}>{evt.date ? MON[new Date(evt.date + 'T00:00:00').getMonth()] : ''}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0A5F52', marginBottom: 9 }}>{evt.category}</div>
                  <h3 style={{ fontWeight: 600, fontSize: 23, lineHeight: 1.28, margin: '0 0 8px', color: '#12564C' }}>{evt.title || 'Untitled'}</h3>
                  <p style={{ margin: '0 0 14px', fontSize: 17, lineHeight: 1.56, color: '#4E5F5A' }}>{evt.summary}</p>
                  <div style={{ borderTop: '1px solid #F1F5F3', paddingTop: 12, fontSize: 15.5, color: '#6A7A76' }}>{fmtDate(evt.date)} · {evt.venue}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
                {(evt.gallery || []).map((g, i) => (
                  <div key={i}>
                    <div style={{ aspectRatio: '4 / 3', borderRadius: 8, backgroundColor: '#EEF3F1', backgroundImage: bg(msrc(g.mediaId)), backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ fontSize: 13.5, color: '#5A6A66', marginTop: 6 }}>{g.caption}</div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {media ? (
            <>
              <div style={{ aspectRatio: '4 / 3', maxHeight: '60vh', borderRadius: 10, backgroundColor: '#EEF3F1', backgroundImage: bg(media.dataUrl || media.src), backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
              <div style={{ marginTop: 14, fontSize: 17, fontWeight: 600, color: '#16413A' }}>{media.name}</div>
              <div style={{ fontSize: 14.5, color: '#7A8C87', marginTop: 4 }}>{[media.width ? media.width + ' × ' + media.height + ' px' : '', kb(media.size), (media.type || '').replace('image/', '').toUpperCase(), 'Uploaded ' + fmtDate(media.uploadedAt)].filter(Boolean).join(' · ')}</div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ImageEditor() {
  const admin = useAdmin();
  const { editor, edSaving, queueCount } = admin;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  useEffect(() => {
    const ed = admin.editor;
    const c = canvasRef.current;
    if (ed && ed.img && c) {
      const ctx = c.getContext('2d');
      if (ctx) drawTo(ctx, c.width, c.height, ed, true);
    }
  }, [admin.editor]);

  if (!editor) return null;
  const P = PRESETS[editor.preset];
  const small = !!(editor.src.w && (editor.src.w < P.w || editor.src.h < P.h));
  const edReady = !editor.loading && !!editor.img && !editor.error;

  const onDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const c = event.currentTarget;
    try {
      c.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values());
      pinchRef.current = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom: editor.zoom };
      dragRef.current = null;
      return;
    }
    dragRef.current = { px: event.clientX, py: event.clientY, x: editor.x, y: editor.y, w: c.clientWidth, h: c.clientHeight };
  };
  const onMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchRef.current.dist > 0 && dist > 0) {
        const zoom = Math.min(4, Math.max(1, +(pinchRef.current.zoom * (dist / pinchRef.current.dist)).toFixed(3)));
        admin.edSet({ zoom });
      }
      return;
    }
    const d = dragRef.current;
    if (!d) return;
    admin.edSet({ x: d.x + (event.clientX - d.px) / d.w, y: d.y + (event.clientY - d.py) / d.h });
  };
  const onUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    dragRef.current = null;
  };

  const blockStyle: CSSProperties = {
    width: P.vw,
    height: P.vh,
    maxWidth: '100%',
    borderRadius: 10,
    aspectRatio: P.vw + ' / ' + P.vh,
  };

  return (
    <div className={styles.editorOverlay} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(8,30,28,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <div role="dialog" aria-modal="true" className={styles.editorCard} style={{ width: '100%', maxWidth: 1000, maxHeight: 'calc(100vh - 56px)', overflow: 'auto', background: '#ffffff', borderRadius: 16, boxShadow: '0 40px 90px -30px rgba(0,0,0,0.5)', animation: 'cmsUp 0.26s ease' }}>
        <div className={styles.editorHead} style={{ padding: '20px 26px', borderBottom: '1px solid #EEF3F1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <h3 style={{ fontWeight: 600, fontSize: 21, margin: 0, color: '#0B3C49' }}>Adjust {P.label.toLowerCase()}</h3>
          {queueCount > 0 ? (
            <span style={{ fontSize: 14, color: '#7A8C87' }}>{queueCount + ' more ' + (queueCount === 1 ? 'image' : 'images') + ' waiting after this one'}</span>
          ) : null}
        </div>
        <div className={styles.editorBody} style={{ padding: '24px 26px', display: 'grid', gridTemplateColumns: 'auto minmax(260px, 1fr)', gap: 28, alignItems: 'start' }}>
          <div className={styles.editorStage}>
            {editor.loading ? (
              <div className={styles.editorBlock} style={{ ...blockStyle, background: '#EEF3F1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#5A6A66', fontSize: 15.5 }}>
                <span className={styles.spin} style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid #CFE6E0', borderTopColor: '#0A8E7B' }} />
                Uploading image…
              </div>
            ) : null}
            {editor.error ? (
              <div className={styles.editorBlock} style={{ ...blockStyle, background: '#FDF1F0', border: '1px solid #F6D8D5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 30, textAlign: 'center', color: '#9E2018', fontSize: 16, lineHeight: 1.5 }}>
                <strong style={{ fontSize: 18 }}>Upload failed</strong>
                {editor.error}
                <button type="button" onClick={admin.edRetry} style={{ height: 42, padding: '0 18px', border: 'none', borderRadius: 8, background: '#C42A21', color: '#ffffff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Choose another file</button>
              </div>
            ) : null}
            {edReady ? (
              <>
                <canvas
                  ref={canvasRef}
                  width={P.vw * 2}
                  height={P.vh * 2}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  className={styles.editorCanvas}
                  style={{ display: 'block', width: P.vw, height: P.vh, maxWidth: '100%', borderRadius: 10, cursor: 'grab', touchAction: 'none', aspectRatio: P.vw + ' / ' + P.vh }}
                />
                <div style={{ fontSize: 13.5, color: '#7A8C87', marginTop: 8, textAlign: 'center' }}>Drag the photo to reposition it.</div>
              </>
            ) : null}
          </div>
          <div className={styles.editorSide} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ background: '#F7FAF9', border: '1px solid #EEF3F1', borderRadius: 10, padding: '14px 16px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: 14.5 }}>
              <span style={{ color: '#7A8C87' }}>File</span><span style={{ color: '#16413A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editor.src.name || '—'}</span>
              <span style={{ color: '#7A8C87' }}>Original</span><span style={{ color: '#16413A' }}>{editor.src.w ? editor.src.w + ' × ' + editor.src.h + ' px' : '—'} · {kb(editor.src.size)} · {(editor.src.type || '').replace('image/', '').toUpperCase() || '—'}</span>
              <span style={{ color: '#7A8C87' }}>Saved as</span><span style={{ color: '#16413A' }}>{P.w} × {P.h} px</span>
              <span style={{ color: '#7A8C87' }}>Shape</span><span style={{ color: '#16413A' }}>{P.ratio + (P.round ? ' · shown as a circle on the website' : '')}</span>
            </div>
            {small ? (
              <div style={{ background: '#FFFBF2', border: '1px solid #F3E2B8', borderRadius: 8, padding: '11px 14px', fontSize: 14.5, lineHeight: 1.5, color: '#7A5205' }}>This photo is smaller than {P.w} × {P.h} px, so it may look soft on large screens.</div>
            ) : null}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, color: '#23423B', marginBottom: 8 }}><span>Zoom</span><span style={{ color: '#7A8C87', fontWeight: 500 }}>{Math.round(editor.zoom * 100) + '%'}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" onClick={() => admin.edSet({ zoom: Math.max(1, +(editor.zoom - 0.1).toFixed(2)) })} aria-label="Zoom out" style={{ flex: 'none', width: 38, height: 38, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', fontSize: 20, color: '#35514B', cursor: 'pointer' }}>−</button>
                <input type="range" min="1" max="4" step="0.01" value={editor.zoom} onChange={(e) => admin.edSet({ zoom: Number(e.target.value) })} aria-label="Zoom" style={{ flex: 1, accentColor: '#0A8E7B' }} />
                <button type="button" onClick={() => admin.edSet({ zoom: Math.min(4, +(editor.zoom + 0.1).toFixed(2)) })} aria-label="Zoom in" style={{ flex: 'none', width: 38, height: 38, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', fontSize: 20, color: '#35514B', cursor: 'pointer' }}>+</button>
              </div>
            </div>
            <div className={styles.rotateRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button type="button" onClick={() => admin.edSet({ rot: editor.rot - 90, x: 0, y: 0 })} style={{ height: 40, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 14.5, cursor: 'pointer' }}>↺ Rotate</button>
              <button type="button" onClick={() => admin.edSet({ rot: editor.rot + 90, x: 0, y: 0 })} style={{ height: 40, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 14.5, cursor: 'pointer' }}>Rotate ↻</button>
              <button type="button" onClick={() => admin.edSet({ zoom: 1, x: 0, y: 0, rot: 0 })} style={{ height: 40, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 14.5, cursor: 'pointer' }}>Reset</button>
            </div>
            <div className={styles.editorActions} style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button type="button" onClick={admin.edCancel} style={{ flex: 1, height: 48, border: '1px solid #D5E2DE', borderRadius: 8, background: '#ffffff', color: '#35514B', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={admin.edSave} style={{ flex: 1.4, height: 48, border: 'none', borderRadius: 8, background: '#0A8E7B', color: '#ffffff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{edSaving ? 'Saving…' : 'Save image'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
