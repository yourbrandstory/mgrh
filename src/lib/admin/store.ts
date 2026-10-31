'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase/env';
import type {
  ActivityItem,
  AdminDb,
  AdminUser,
  Collection,
  Doctor,
  EventRecord,
  Facility,
  MediaItem,
  SessionUser,
} from './types';

const BUCKET = 'media';
export const KEY = 'mgrh-cms-v1';

let db: AdminDb = emptyDb();
let currentUser: SessionUser | null = null;
let currentUserId = '';
let accessToken = '';
let client: SupabaseClient | null = null;
let ready = false;
let started = false;
let initPromise: Promise<void> | null = null;
const subs = new Set<(next: AdminDb) => void>();
const idMap = new Map<string, string>();
let profileNames = new Map<string, string>();

function emptyDb(): AdminDb {
  return {
    version: 1,
    doctors: [],
    facilities: [],
    events: [],
    categories: { doctors: [], facilities: [], events: [] },
    media: [],
    activity: [],
    settings: { editorsCanPublish: false, users: [] },
  };
}

export function now(): string {
  return new Date().toISOString();
}

export function uid(prefix?: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 9);
}

export function load(): AdminDb {
  return db;
}

export function isReady(): boolean {
  return ready;
}

function notify() {
  subs.forEach((fn) => {
    try {
      fn(db);
    } catch {
      /* ignore subscriber errors */
    }
  });
}

function isUuid(value: unknown): boolean {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hash32(value: string, seed: number): string {
  let h = seed >>> 0;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return ('00000000' + h.toString(16)).slice(-8);
}

export function uuidFor(value: unknown): string {
  if (isUuid(value)) return value as string;
  const key = String(value || '');
  if (idMap.has(key)) return idMap.get(key) as string;
  const hex = hash32(key, 2166136261) + hash32(key, 2246822507) + hash32(key, 3266489909) + hash32(key, 668265263);
  const uuid = hex.slice(0, 8) + '-' + hex.slice(8, 12) + '-5' + hex.slice(13, 16) + '-a' + hex.slice(17, 20) + '-' + hex.slice(20, 32);
  idMap.set(key, uuid);
  return uuid;
}

function num(value: unknown): number {
  const n = parseInt(String(value), 10);
  return isNaN(n) ? 0 : n;
}

function timeValue(value: unknown): string | null {
  if (!value) return null;
  const text = String(value);
  return /^\d{2}:\d{2}$/.test(text) ? text : text.slice(0, 5);
}

function timeText(value: unknown): string {
  return value ? String(value).slice(0, 5) : '';
}

function roleLabel(value: string | null | undefined): string {
  return value === 'administrator' ? 'Administrator' : 'Editor';
}

function roleValue(value: string | null | undefined): string {
  return value === 'Administrator' ? 'administrator' : 'editor';
}

function encodePath(path: string): string {
  return String(path || '')
    .split('/')
    .map(encodeURIComponent)
    .join('/');
}

function publicUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + encodePath(path);
}

function pathFromUrl(url: string): string {
  if (!url) return '';
  const marker = '/storage/v1/object/public/' + BUCKET + '/';
  const index = String(url).indexOf(marker);
  if (index < 0) return '';
  return decodeURIComponent(String(url).slice(index + marker.length));
}

function dataUrlMime(dataUrl: string): string {
  const match = /^data:([^;,]+)/i.exec(dataUrl || '');
  return match ? match[1] : 'image/jpeg';
}

function dataUrlBytes(dataUrl: string): Uint8Array {
  const comma = String(dataUrl || '').indexOf(',');
  if (comma < 0) throw new Error('The image could not be read.');
  const base64 = String(dataUrl).slice(comma + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function request(method: string, path: string, body?: unknown, prefer?: string, contentType?: string): any {
  const xhr = new XMLHttpRequest();
  xhr.open(method, SUPABASE_URL + path, false);
  xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
  if (accessToken) xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  if (body !== undefined && body !== null) xhr.setRequestHeader('Content-Type', contentType || 'application/json');
  if (prefer) xhr.setRequestHeader('Prefer', prefer);
  xhr.send(body === undefined || body === null ? null : typeof body === 'string' ? body : JSON.stringify(body));
  if (xhr.status < 200 || xhr.status >= 300) {
    throw new Error((xhr.responseText || 'Request failed (' + xhr.status + ')').slice(0, 500));
  }
  return xhr.responseText ? JSON.parse(xhr.responseText) : null;
}

function api(path: string, method: string, body?: unknown): any {
  const xhr = new XMLHttpRequest();
  xhr.open(method, path, false);
  xhr.setRequestHeader('Accept', 'application/json');
  if (body !== undefined && body !== null) xhr.setRequestHeader('Content-Type', 'application/json');
  if (accessToken) xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.send(body === undefined || body === null ? null : JSON.stringify(body));
  if (xhr.status < 200 || xhr.status >= 300) {
    let message = xhr.responseText || 'Request failed (' + xhr.status + ')';
    try {
      message = JSON.parse(message).error || message;
    } catch {
      /* keep raw text */
    }
    throw new Error(message);
  }
  return xhr.responseText ? JSON.parse(xhr.responseText) : null;
}

function uploadObject(path: string, bytes: Uint8Array, mime: string) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + encodePath(path), false);
  xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.setRequestHeader('Content-Type', mime || 'image/jpeg');
  xhr.setRequestHeader('x-upsert', 'true');
  xhr.send(bytes as unknown as XMLHttpRequestBodyInit);
  if (xhr.status < 200 || xhr.status >= 300) {
    throw new Error((xhr.responseText || 'Image upload failed (' + xhr.status + ')').slice(0, 500));
  }
}

function deleteObject(path: string | undefined | null) {
  if (!path) return;
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', SUPABASE_URL + '/storage/v1/object/' + BUCKET + '/' + encodePath(path), false);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.send(null);
  } catch {
    /* ignore */
  }
}

function makeStoragePath(media: MediaItem, suffix: string): string {
  const name =
    String(media.name || 'image')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'image';
  const ext = dataUrlMime(media.dataUrl || media.src || '').indexOf('png') >= 0 ? 'png' : 'jpg';
  return 'cms/' + name + '-' + uuidFor(media.id).slice(0, 8) + '-' + Date.now() + '-' + suffix + '.' + ext;
}

function mapMedia(row: any): MediaItem {
  return {
    id: row.id,
    name: row.file_name,
    src: publicUrl(row.storage_path),
    width: row.width,
    height: row.height,
    size: row.size_bytes,
    type: row.mime_type,
    uploadedAt: row.uploaded_at,
    preset: row.preset,
    crop: row.crop,
    storagePath: row.storage_path,
    originalPath: row.original_path,
    originalSrc: row.original_path ? publicUrl(row.original_path) : '',
  };
}

function mapDoctor(row: any): Doctor {
  return {
    id: row.id,
    order: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: profileNames.get(row.updated_by) || '',
    name: row.name,
    designation: row.designation,
    speciality: row.speciality,
    qualifications: row.qualifications,
    experience: row.experience,
    bio: row.bio,
    schedule: row.schedule,
    days: row.days || [],
    start: timeText(row.start_time),
    end: timeText(row.end_time),
    location: row.location,
    contact: row.contact,
    showContact: !!row.show_contact,
    imageId: row.image_id,
    imageAlt: row.image_alt,
  };
}

function mapFacility(row: any, images: any[]): Facility {
  return {
    id: row.id,
    order: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: profileNames.get(row.updated_by) || '',
    name: row.name,
    category: row.category,
    short: row.short_description,
    full: row.full_description,
    subcategory: row.subcategory,
    subitems: row.subitems || [],
    images: (images || []).map((image) => ({ mediaId: image.media_id, caption: image.caption, alt: image.alt })),
    coverIndex: row.cover_index || 0,
    review: !!row.needs_review,
  };
}

function mapEvent(row: any, images: any[]): EventRecord {
  return {
    id: row.id,
    order: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: profileNames.get(row.updated_by) || '',
    title: row.title,
    category: row.category,
    date: row.event_date || '',
    endDate: row.end_date || '',
    start: timeText(row.start_time),
    end: timeText(row.end_time),
    venue: row.venue,
    summary: row.summary,
    description: row.description,
    organiser: row.organiser,
    highlights: row.highlights,
    coverId: row.cover_id,
    coverAlt: row.cover_alt,
    shotLabels: row.placeholder_slots || 0,
    gallery: (images || []).map((image) => ({ mediaId: image.media_id, caption: image.caption, alt: image.alt })),
  };
}

function mapActivity(row: any): ActivityItem {
  return {
    id: String(row.id),
    at: row.at,
    who: row.actor_name,
    action: row.action,
    type: row.entity_type,
    title: row.entity_title,
  };
}

async function optional<T>(query: PromiseLike<{ data?: T | null; error?: unknown }>, fallback: T): Promise<T> {
  try {
    const result = await query;
    if (result.error) return fallback;
    return (result.data as T) || fallback;
  } catch {
    return fallback;
  }
}

async function fetchAll(): Promise<AdminDb> {
  const sb = client as any;
  const publicOnly = !accessToken;
  let qDoctors = sb.from('doctors').select('*').order('sort_order', { ascending: true });
  let qFacilities = sb.from('facilities').select('*').order('sort_order', { ascending: true });
  let qEvents = sb.from('events').select('*').order('sort_order', { ascending: true });
  if (publicOnly) {
    qDoctors = qDoctors.eq('status', 'published');
    qFacilities = qFacilities.eq('status', 'published');
    qEvents = qEvents.eq('status', 'published');
  }
  const results: any[] = await Promise.all([
    qDoctors,
    qFacilities,
    sb.from('facility_images').select('*').order('sort_order', { ascending: true }),
    qEvents,
    sb.from('event_images').select('*').order('sort_order', { ascending: true }),
    sb.from('categories').select('*').order('sort_order', { ascending: true }),
    sb.from('media').select('*').order('uploaded_at', { ascending: false }),
    sb.from('activity_log').select('*').order('at', { ascending: false }).limit(200),
    sb.from('settings').select('*').eq('id', 1).maybeSingle(),
    sb.from('profiles').select('id, full_name, role').order('created_at', { ascending: true }),
  ]);

  const doctors = results[0];
  const facilities = results[1];
  const facilityImages = results[2];
  const events = results[3];
  const eventImages = results[4];
  const categories = results[5];
  const media = results[6];
  const activity = results[7];
  const settings = results[8];
  const profiles = results[9];

  if (doctors.error && accessToken) throw doctors.error;
  if (facilities.error && accessToken) throw facilities.error;
  if (events.error && accessToken) throw events.error;

  const facilityImageRows: any[] = facilityImages.error ? [] : facilityImages.data || [];
  const eventImageRows: any[] = eventImages.error ? [] : eventImages.data || [];
  const categoryRows: any[] = categories.error ? [] : categories.data || [];
  const mediaRows: any[] = media.error ? [] : media.data || [];
  const activityRows: any[] = activity.error ? [] : activity.data || [];
  const profileRows: any[] = profiles.error ? [] : profiles.data || [];
  const settingsRow = settings.error ? null : settings.data;

  const facilityImagesBy = new Map<string, any[]>();
  facilityImageRows.forEach((image) => {
    const list = facilityImagesBy.get(image.facility_id) || [];
    list.push(image);
    facilityImagesBy.set(image.facility_id, list);
  });

  const eventImagesBy = new Map<string, any[]>();
  eventImageRows.forEach((image) => {
    const list = eventImagesBy.get(image.event_id) || [];
    list.push(image);
    eventImagesBy.set(image.event_id, list);
  });

  profileNames = new Map();
  profileRows.forEach((profile) => {
    profileNames.set(profile.id, profile.full_name || '');
  });

  const categoryMap = { doctors: [] as string[], facilities: [] as string[], events: [] as string[] };
  categoryRows.forEach((category) => {
    if (categoryMap[category.kind as Collection]) categoryMap[category.kind as Collection].push(category.name);
  });

  const usersByEmail = new Map<string, AdminUser>();
  profileRows.forEach((profile) => {
    const email = currentUser && currentUserId === profile.id ? currentUser.email : '';
    usersByEmail.set(email ? email.toLowerCase() : 'id:' + profile.id, {
      id: profile.id,
      email,
      name: profile.full_name || '',
      role: roleLabel(profile.role),
    });
  });
  if (currentUser && currentUser.email) {
    const selfKey = currentUser.email.toLowerCase();
    if (!usersByEmail.has(selfKey)) {
      usersByEmail.set(selfKey, {
        id: currentUserId,
        email: currentUser.email,
        name: currentUser.name,
        role: currentUser.role,
      });
    }
  }

  return {
    version: 1,
    doctors: (doctors.data || []).map(mapDoctor),
    facilities: (facilities.data || []).map((row: any) => mapFacility(row, facilityImagesBy.get(row.id) || [])),
    events: (events.data || []).map((row: any) => mapEvent(row, eventImagesBy.get(row.id) || [])),
    categories: categoryMap,
    media: mediaRows.map(mapMedia),
    activity: activityRows.map(mapActivity),
    settings: {
      editorsCanPublish: !!(settingsRow && settingsRow.editors_can_publish),
      users: Array.from(usersByEmail.values()),
    },
  };
}

async function refresh(): Promise<AdminDb> {
  db = await fetchAll();
  notify();
  return db;
}

function loadDirectory() {
  const token = accessToken;
  if (!token) return;
  fetch('/api/admin-ui/directory', {
    headers: { Authorization: 'Bearer ' + token },
    cache: 'no-store',
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((list) => {
      if (!Array.isArray(list) || token !== accessToken) return;
      const users: AdminUser[] = list.map((person: any) => ({
        id: person.id,
        email: person.email,
        name: person.full_name || person.email,
        role: roleLabel(person.role),
      }));
      if (
        currentUser &&
        currentUser.email &&
        !users.some((person) => person.email.toLowerCase() === currentUser!.email.toLowerCase())
      ) {
        users.push({
          id: currentUserId,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
        });
      }
      db.settings.users = users;
      notify();
    })
    .catch(() => {
      /* directory is optional */
    });
}

async function sessionFromUser(user: { id: string; email?: string }): Promise<SessionUser> {
  const profile = await optional<{ full_name?: string; role?: string } | null>(
    client!.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle() as any,
    null,
  );
  return {
    email: user.email || '',
    name: (profile && profile.full_name) || user.email || 'Staff',
    role: roleLabel(profile && profile.role),
  };
}

export function signIn(email: string, password: string): Promise<SessionUser> {
  if (!client) return Promise.reject(new Error('The content store is still loading.'));
  return client.auth.signInWithPassword({ email, password }).then(async (result) => {
    if (result.error) throw result.error;
    currentUserId = result.data.user.id;
    accessToken = result.data.session ? result.data.session.access_token : '';
    currentUser = await sessionFromUser(result.data.user);
    await refresh();
    loadDirectory();
    return currentUser;
  });
}

export function signOut(): Promise<void> {
  if (!client) return Promise.resolve();
  return client.auth.signOut().then(() => {
    currentUser = null;
    currentUserId = '';
    accessToken = '';
    return refresh().then(() => undefined).catch(() => undefined);
  });
}

export function setSession(user: SessionUser | null) {
  currentUser = user || null;
  if (user && user.email) {
    const found = db.settings.users.find((person) => person.email.toLowerCase() === user.email.toLowerCase());
    if (found) found.name = user.name;
  }
}

export function clearSession() {
  currentUser = null;
  currentUserId = '';
  accessToken = '';
}

export function session(): SessionUser | null {
  return currentUser;
}

export function updatePassword(password: string): Promise<boolean> {
  if (!client) return Promise.reject(new Error('The content store is still loading.'));
  return client.auth.updateUser({ password }).then((result) => {
    if (result.error) throw result.error;
    return true;
  });
}

export function mediaSrc(id: string | null | undefined): string {
  const media = db.media.find((item) => item.id === id);
  return media ? media.dataUrl || media.src || '' : '';
}

export function published(type: Collection, opts?: { preview?: boolean }): any[] {
  const preview = (opts && opts.preview) || (typeof location !== 'undefined' && /[?&]preview=1/.test(location.search) && !!session());
  return (db[type] || []).filter((row) => preview || row.status === 'published').slice().sort((a, b) => (a.order || 0) - (b.order || 0));
}

function upsert(table: string, rows: any[], conflict?: string) {
  if (!rows.length) return;
  request('POST', '/rest/v1/' + table + (conflict ? '?on_conflict=' + conflict : ''), rows, 'resolution=merge-duplicates,return=minimal');
}

function withoutAudit(row: any): any {
  const copy = { ...row };
  delete copy.createdAt;
  delete copy.updatedAt;
  delete copy.updatedBy;
  return copy;
}

function sameRecord(left: any, right: any): boolean {
  return JSON.stringify(withoutAudit(left)) === JSON.stringify(withoutAudit(right));
}

function sameGallery(left: any[] | undefined, right: any[] | undefined): boolean {
  const a = left || [];
  const b = right || [];
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if ((a[i].mediaId || '') !== (b[i].mediaId || '')) return false;
    if ((a[i].caption || '') !== (b[i].caption || '')) return false;
    if ((a[i].alt || '') !== (b[i].alt || '')) return false;
  }
  return true;
}

function sameMedia(left: MediaItem | undefined, right: MediaItem): boolean {
  if (!left) return false;
  if (left.dataUrl || right.dataUrl || right.originalDataUrl) return false;
  if (left.src && left.src.indexOf('data:') === 0) return false;
  if (right.src && right.src.indexOf('data:') === 0) return false;
  const keys: (keyof MediaItem)[] = ['name', 'width', 'height', 'size', 'type', 'preset', 'crop', 'storagePath', 'originalPath', 'src'];
  for (const key of keys) {
    if (JSON.stringify(left[key] || null) !== JSON.stringify(right[key] || null)) return false;
  }
  return true;
}

function remove(table: string, filter: string) {
  request('DELETE', '/rest/v1/' + table + '?' + filter, null, 'return=minimal');
}

function mediaRow(media: MediaItem, previous?: MediaItem): any {
  const dataUrl = media.dataUrl || (media.src && media.src.indexOf('data:') === 0 ? media.src : '');
  let storagePath = media.storagePath || pathFromUrl(media.src);
  let originalPath = media.originalPath || (previous && previous.originalPath) || '';
  let bytes: Uint8Array | null = null;
  let mime = media.type || 'image/jpeg';

  if (dataUrl) {
    bytes = dataUrlBytes(dataUrl);
    mime = dataUrlMime(dataUrl);
    storagePath = makeStoragePath(media, 'web');
    uploadObject(storagePath, bytes, mime);
    media.src = publicUrl(storagePath);
    media.storagePath = storagePath;
    media.dataUrl = null;
    media.type = mime;
    media.size = media.size || bytes.length;
  }

  if (media.originalDataUrl) {
    const originalBytes = dataUrlBytes(media.originalDataUrl);
    const originalMime = dataUrlMime(media.originalDataUrl);
    originalPath = makeStoragePath(media, 'original');
    uploadObject(originalPath, originalBytes, originalMime);
    media.originalSrc = publicUrl(originalPath);
    media.originalPath = originalPath;
    media.originalDataUrl = null;
  }

  if (!storagePath) throw new Error('The image "' + (media.name || 'image') + '" has no stored file.');

  const row = {
    id: uuidFor(media.id),
    file_name: media.name || 'image.jpg',
    storage_path: storagePath,
    original_path: originalPath || null,
    width: media.width || null,
    height: media.height || null,
    size_bytes: media.size || (bytes ? bytes.length : null),
    mime_type: media.type || mime,
    preset: media.preset || 'facility',
    crop: media.crop || null,
    uploaded_by: currentUserId,
  };

  if (previous && previous.storagePath && previous.storagePath !== storagePath) deleteObject(previous.storagePath);
  if (previous && previous.originalPath && previous.originalPath !== originalPath) deleteObject(previous.originalPath);
  return row;
}

function doctorRow(doctor: Doctor): any {
  return {
    id: uuidFor(doctor.id),
    name: doctor.name || '',
    designation: doctor.designation || '',
    speciality: doctor.speciality || '',
    qualifications: doctor.qualifications || '',
    experience: doctor.experience || '',
    bio: doctor.bio || '',
    schedule: doctor.schedule || '',
    days: Array.isArray(doctor.days) ? doctor.days : [],
    start_time: timeValue(doctor.start),
    end_time: timeValue(doctor.end),
    location: doctor.location || '',
    contact: doctor.contact || '',
    show_contact: !!doctor.showContact,
    image_id: doctor.imageId ? uuidFor(doctor.imageId) : null,
    image_alt: doctor.imageAlt || '',
    sort_order: num(doctor.order),
    status: doctor.status || 'draft',
    updated_by: currentUserId,
  };
}

function facilityRow(facility: Facility): any {
  return {
    id: uuidFor(facility.id),
    name: facility.name || '',
    category: facility.category || '',
    subcategory: facility.subcategory || '',
    short_description: facility.short || '',
    full_description: facility.full || '',
    subitems: Array.isArray(facility.subitems) ? facility.subitems : [],
    cover_index: num(facility.coverIndex),
    needs_review: !!facility.review,
    sort_order: num(facility.order),
    status: facility.status || 'draft',
    updated_by: currentUserId,
  };
}

function eventRow(event: EventRecord): any {
  return {
    id: uuidFor(event.id),
    title: event.title || '',
    category: event.category || '',
    event_date: event.date || null,
    end_date: event.endDate || null,
    start_time: timeValue(event.start),
    end_time: timeValue(event.end),
    venue: event.venue || '',
    summary: event.summary || '',
    description: event.description || '',
    organiser: event.organiser || '',
    highlights: event.highlights || '',
    cover_id: event.coverId ? uuidFor(event.coverId) : null,
    cover_alt: event.coverAlt || '',
    placeholder_slots: num(event.shotLabels),
    sort_order: num(event.order),
    status: event.status || 'draft',
    updated_by: currentUserId,
  };
}

function galleryRows(parentId: string, key: string, items: any[]): any[] {
  return (items || []).map((item, index) => {
    const row: any = {
      media_id: uuidFor(item.mediaId),
      caption: item.caption || '',
      alt: item.alt || '',
      sort_order: index,
    };
    row[key] = parentId;
    return row;
  });
}

function applyMedia(next: AdminDb) {
  const previous = new Map(db.media.map((media) => [media.id, media] as const));
  const nextIds = new Set(next.media.map((media) => media.id));
  const rows: any[] = [];
  next.media.forEach((media) => {
    const before = previous.get(media.id);
    if (!sameMedia(before, media)) rows.push(mediaRow(media, before));
  });
  upsert('media', rows, 'id');
  previous.forEach((media, id) => {
    if (nextIds.has(id)) return;
    if (media.storagePath) deleteObject(media.storagePath);
    if (media.originalPath) deleteObject(media.originalPath);
    remove('media', 'id=eq.' + uuidFor(id));
  });
}

function applyDoctors(next: AdminDb) {
  const previous = new Map(db.doctors.map((doctor) => [doctor.id, doctor] as const));
  const nextIds = new Set(next.doctors.map((doctor) => doctor.id));
  const rows: any[] = [];
  next.doctors.forEach((doctor) => {
    const before = previous.get(doctor.id);
    if (!before || !sameRecord(before, doctor)) rows.push(doctorRow(doctor));
  });
  upsert('doctors', rows, 'id');
  previous.forEach((doctor, id) => {
    if (!nextIds.has(id)) remove('doctors', 'id=eq.' + uuidFor(id));
  });
}

function applyFacilities(next: AdminDb) {
  const previous = new Map(db.facilities.map((facility) => [facility.id, facility] as const));
  const nextIds = new Set(next.facilities.map((facility) => facility.id));
  const rows: any[] = [];
  next.facilities.forEach((facility) => {
    const before = previous.get(facility.id);
    if (!before || !sameRecord(before, facility)) rows.push(facilityRow(facility));
  });
  upsert('facilities', rows, 'id');
  next.facilities.forEach((facility) => {
    const before = previous.get(facility.id);
    if (before && sameGallery(before.images, facility.images)) return;
    const id = uuidFor(facility.id);
    remove('facility_images', 'facility_id=eq.' + id);
    const imageRows = galleryRows(id, 'facility_id', facility.images);
    if (imageRows.length) request('POST', '/rest/v1/facility_images', imageRows, 'return=minimal');
  });
  previous.forEach((facility, id) => {
    if (!nextIds.has(id)) remove('facilities', 'id=eq.' + uuidFor(id));
  });
}

function applyEvents(next: AdminDb) {
  const previous = new Map(db.events.map((event) => [event.id, event] as const));
  const nextIds = new Set(next.events.map((event) => event.id));
  const rows: any[] = [];
  next.events.forEach((event) => {
    const before = previous.get(event.id);
    if (!before || !sameRecord(before, event)) rows.push(eventRow(event));
  });
  upsert('events', rows, 'id');
  next.events.forEach((event) => {
    const before = previous.get(event.id);
    if (before && sameGallery(before.gallery, event.gallery)) return;
    const id = uuidFor(event.id);
    remove('event_images', 'event_id=eq.' + id);
    const imageRows = galleryRows(id, 'event_id', event.gallery);
    if (imageRows.length) request('POST', '/rest/v1/event_images', imageRows, 'return=minimal');
  });
  previous.forEach((event, id) => {
    if (!nextIds.has(id)) remove('events', 'id=eq.' + uuidFor(id));
  });
}

function applyCategories(next: AdminDb) {
  (['doctors', 'facilities', 'events'] as Collection[]).forEach((kind) => {
    const desired = next.categories[kind] || [];
    const previous = db.categories[kind] || [];
    if (desired.length === previous.length && desired.every((name, index) => name === previous[index])) return;
    previous.forEach((name) => {
      if (desired.indexOf(name) < 0) remove('categories', 'kind=eq.' + kind + '&name=eq.' + encodeURIComponent(name));
    });
    const rows = desired.map((name, index) => ({ kind, name, sort_order: index }));
    if (rows.length) {
      request('POST', '/rest/v1/categories?on_conflict=kind,name', rows, 'resolution=merge-duplicates,return=minimal');
    }
  });
}

function applyActivity(next: AdminDb) {
  const previous = new Map(
    db.activity.filter((item) => item.id).map((item) => [String(item.id), item] as const),
  );
  const nextIds = new Set(next.activity.filter((item) => item.id).map((item) => String(item.id)));
  const additions = next.activity.filter((item) => !item.id);
  if (additions.length) {
    const rows = additions.map((item) => ({
      at: item.at || now(),
      actor: currentUserId,
      actor_name: item.who || (currentUser && currentUser.name) || 'Staff',
      action: item.action || 'Updated',
      entity_type: item.type || 'Content',
      entity_title: item.title || '',
    }));
    const inserted = request('POST', '/rest/v1/activity_log', rows, 'return=representation');
    if (Array.isArray(inserted)) {
      additions.forEach((item, index) => {
        if (inserted[index]) item.id = String(inserted[index].id);
      });
    }
  }
  previous.forEach((item, id) => {
    if (!nextIds.has(id)) remove('activity_log', 'id=eq.' + encodeURIComponent(id));
  });
}

function applyUsers(next: AdminDb) {
  const previous = new Map<string, AdminUser>();
  db.settings.users.forEach((person) => {
    if (person.email) previous.set(person.email.toLowerCase(), person);
  });
  const nextEmails = new Set<string>();
  next.settings.users.forEach((person) => {
    if (person.email) nextEmails.add(person.email.toLowerCase());
  });

  previous.forEach((person, email) => {
    if (!nextEmails.has(email) && person.id && person.id !== currentUserId) {
      api('/api/admin-ui/users', 'DELETE', { id: person.id });
    }
  });

  next.settings.users.forEach((person) => {
    if (!person.email) return;
    const email = person.email.toLowerCase();
    const before = previous.get(email);
    if (!before) {
      const password = person.password || 'mgrh-' + Math.random().toString(36).slice(2, 8);
      const created = api('/api/admin-ui/users', 'POST', {
        email: person.email,
        name: person.name,
        role: person.role,
        password,
      });
      if (created && created.id) person.id = created.id;
      delete person.password;
      return;
    }
    if (before.id && (before.name !== person.name || before.role !== person.role)) {
      request(
        'PATCH',
        '/rest/v1/profiles?id=eq.' + uuidFor(before.id),
        { full_name: person.name || '', role: roleValue(person.role) },
        'return=minimal',
      );
    }
    delete person.password;
  });
}

function applySettings(next: AdminDb) {
  if (!!next.settings.editorsCanPublish !== !!db.settings.editorsCanPublish) {
    request('PATCH', '/rest/v1/settings?id=eq.1', { editors_can_publish: !!next.settings.editorsCanPublish }, 'return=minimal');
  }
  applyUsers(next);
}

export function commit(next: AdminDb): AdminDb {
  if (!ready || !client) throw new Error('The content store is still loading.');
  if (!currentUserId || !accessToken) throw new Error('Sign in to save changes.');
  if (!next || next.version !== 1 || !Array.isArray(next.doctors) || !Array.isArray(next.media)) {
    throw new Error('The content data is not valid.');
  }
  applyMedia(next);
  applyDoctors(next);
  applyFacilities(next);
  applyEvents(next);
  applyCategories(next);
  applySettings(next);
  applyActivity(next);
  db = next;
  notify();
  revalidate();
  return db;
}

function revalidate() {
  try {
    fetch('/api/revalidate', { method: 'POST', credentials: 'include' }).catch(() => {
      /* revalidation is best-effort */
    });
  } catch {
    /* ignore */
  }
}

export function reset(): AdminDb {
  return db;
}

export function seed(): AdminDb {
  return db;
}

export function subscribe(fn: (next: AdminDb) => void): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function init(): Promise<void> {
  if (started && initPromise) return initPromise;
  started = true;
  initPromise = (async () => {
    const c = createClient();
    if (!c) throw new Error('The content store is still loading.');
    client = c;

    c.auth.onAuthStateChange((event: string, authSession: { user: { id: string }; access_token: string } | null) => {
      if (authSession) {
        currentUserId = authSession.user.id;
        accessToken = authSession.access_token;
      } else if (event === 'SIGNED_OUT') {
        currentUserId = '';
        accessToken = '';
        currentUser = null;
      }
    });

    try {
      const result = await c.auth.getSession();
      const authSession = result.data ? result.data.session : null;
      if (authSession) {
        currentUserId = authSession.user.id;
        accessToken = authSession.access_token;
        currentUser = await sessionFromUser(authSession.user);
      }
      await refresh();
      loadDirectory();
    } catch (error) {
      console.error('MGRH store could not load content.', error);
      db = emptyDb();
    }

    ready = true;
    notify();
  })();
  return initPromise;
}
