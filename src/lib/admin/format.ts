import type {
  AdminDb,
  Collection,
  Doctor,
  EditorState,
  EventRecord,
  Facility,
  MediaItem,
  Preset,
  PresetKey,
  RecordItem,
  Status,
} from './types';

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const PRESETS: Record<PresetKey, Preset> = {
  doctor: { label: 'Doctor profile', w: 800, h: 800, ratio: '1:1', round: true, vw: 420, vh: 420 },
  facility: { label: 'Facility image', w: 1200, h: 900, ratio: '4:3', round: false, vw: 560, vh: 420 },
  event: { label: 'Event image', w: 1200, h: 900, ratio: '4:3', round: false, vw: 560, vh: 420 },
};

export const SING: Record<Collection, string> = {
  doctors: 'Doctor',
  facilities: 'Facility',
  events: 'Event',
};

export function titleOf(r: { name?: string; title?: string } | null | undefined): string {
  return (r && (r.name || r.title)) || 'Untitled';
}

export function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);
  return isNaN(d.getTime()) ? '—' : d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
}

export function rel(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const m = (Date.now() - d.getTime()) / 60000;
  if (m < 1) return 'Just now';
  if (m < 60) return Math.round(m) + ' min ago';
  if (m < 1440) return Math.round(m / 60) + ' h ago';
  if (m < 10080) return Math.round(m / 1440) + ' days ago';
  return fmtDate(iso);
}

export function kb(b: number): string {
  if (!b) return '—';
  return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
}

export function pill(st: Status): { label: string; bg: string; color: string } {
  return st === 'published'
    ? { label: 'Published', bg: '#E1F3EF', color: '#0A5F52' }
    : { label: 'Draft', bg: '#FDF3E1', color: '#8A5A06' };
}

export function bg(src: string): string {
  return src ? 'url("' + String(src).replace(/"/g, '%22') + '")' : 'none';
}

export function initials(s: string): string {
  return (s || '?')
    .replace(/^Dr\.?\s*/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function blank(type: Collection, db: AdminDb): Doctor | Facility | EventRecord {
  const order = Math.max(0, ...db[type].map((r) => r.order || 0)) + 1;
  const base = { id: '', createdAt: '', updatedAt: '', updatedBy: '' };
  if (type === 'doctors') {
    return {
      ...base,
      name: '', designation: '', speciality: '', qualifications: '', experience: '', bio: '',
      schedule: '', days: [], start: '', end: '', location: '', contact: '',
      showContact: false, imageId: null, imageAlt: '', order, status: 'draft',
    };
  }
  if (type === 'facilities') {
    return {
      ...base,
      name: '', category: '', subcategory: '', short: '', full: '', subitems: [], images: [],
      coverIndex: 0, order, status: 'draft', review: false,
    };
  }
  return {
    ...base,
    title: '', category: '', date: '', endDate: '', start: '', end: '', venue: '', summary: '',
    description: '', organiser: '', highlights: '', coverId: null, coverAlt: '', gallery: [],
    shotLabels: 0, order, status: 'draft',
  };
}

export function validate(type: Collection, d: Record<string, unknown>): Record<string, string> {
  const e: Record<string, string> = {};
  const s = (k: string) => String(d[k] ?? '');
  if (type === 'doctors') {
    if (!s('name').trim()) e.name = 'Enter the doctor’s full name.';
    if (!s('speciality')) e.speciality = 'Choose a speciality.';
    if (s('start') && s('end') && s('end') <= s('start')) e.end = 'End time must be after the start time.';
  }
  if (type === 'facilities') {
    if (!s('name').trim()) e.name = 'Enter the facility name.';
    if (!s('category')) e.category = 'Choose the section this facility appears under.';
  }
  if (type === 'events') {
    if (!s('title').trim()) e.title = 'Enter the event title.';
    if (!s('category')) e.category = 'Choose a category.';
    if (s('endDate') && s('date') && s('endDate') < s('date')) e.endDate = 'End date must be on or after the event date.';
  }
  return e;
}

export interface UsageItem {
  type: Collection;
  label: string;
  title: string;
  status: Status;
  id: string;
}

export function usage(db: AdminDb, id: string): UsageItem[] {
  const u: UsageItem[] = [];
  db.doctors.forEach((r) => {
    if (r.imageId === id) u.push({ type: 'doctors', label: 'Doctor profile', title: r.name, status: r.status, id: r.id });
  });
  db.facilities.forEach((r) => {
    if ((r.images || []).some((i) => i.mediaId === id)) u.push({ type: 'facilities', label: 'Facility gallery', title: r.name, status: r.status, id: r.id });
  });
  db.events.forEach((r) => {
    if (r.coverId === id) u.push({ type: 'events', label: 'Event cover', title: r.title, status: r.status, id: r.id });
    if ((r.gallery || []).some((i) => i.mediaId === id)) u.push({ type: 'events', label: 'Event gallery', title: r.title, status: r.status, id: r.id });
  });
  return u;
}

export function recordTitle(type: Collection | 'media', r: RecordItem | MediaItem): string {
  if (type === 'media') return (r as MediaItem).name;
  return titleOf(r as RecordItem);
}

export function drawTo(ctx: CanvasRenderingContext2D, W: number, H: number, ed: EditorState, mask: boolean): void {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#E7EEEC';
  ctx.fillRect(0, 0, W, H);
  if (!ed.img) return;
  const r = ((ed.rot % 360) + 360) % 360;
  const nw = ed.img.naturalWidth;
  const nh = ed.img.naturalHeight;
  const sw = r % 180 ? nh : nw;
  const sh = r % 180 ? nw : nh;
  const s = Math.max(W / sw, H / sh) * ed.zoom;
  ctx.save();
  ctx.translate(W / 2 + ed.x * W, H / 2 + ed.y * H);
  ctx.rotate((r * Math.PI) / 180);
  ctx.scale(s, s);
  ctx.drawImage(ed.img, -nw / 2, -nh / 2);
  ctx.restore();
  if (!mask) return;
  const P = PRESETS[ed.preset];
  ctx.save();
  if (P.round) {
    ctx.fillStyle = 'rgba(12,34,32,0.55)';
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.arc(W / 2, H / 2, Math.min(W, H) / 2 - 3, 0, Math.PI * 2);
    ctx.fill('evenodd');
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, Math.min(W, H) / 2 - 3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo((W * i) / 3, 0);
      ctx.lineTo((W * i) / 3, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, (H * i) / 3);
      ctx.lineTo(W, (H * i) / 3);
      ctx.stroke();
    }
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
  }
  ctx.restore();
}

export function clampEd(ed: EditorState): EditorState {
  if (!ed.img) return ed;
  const P = PRESETS[ed.preset];
  const r = ((ed.rot % 360) + 360) % 360;
  const nw = ed.img.naturalWidth;
  const nh = ed.img.naturalHeight;
  const sw = r % 180 ? nh : nw;
  const sh = r % 180 ? nw : nh;
  const s = Math.max(P.w / sw, P.h / sh) * ed.zoom;
  const mx = Math.max(0, (sw * s - P.w) / 2) / P.w;
  const my = Math.max(0, (sh * s - P.h) / 2) / P.h;
  return { ...ed, x: Math.min(mx, Math.max(-mx, ed.x)), y: Math.min(my, Math.max(-my, ed.y)) };
}
