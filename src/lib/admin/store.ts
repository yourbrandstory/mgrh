'use client';

import { SUPABASE_URL } from '@/lib/supabase/env';
import { adminRequestHeaders } from './session';
import type {
  AdminDb,
  CategoryRecord,
  Collection,
  DoctorRecord,
  EventRecord,
  FacilityRecord,
  FacilitySlot,
  ManageKey,
  Photo,
  Status,
  SupportRecord,
} from './types';

const BUCKET = 'media';


export function encodePath(path: string): string {
  return String(path || '')
    .split('/')
    .map(encodeURIComponent)
    .join('/');
}

export function publicUrl(path: string): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return SUPABASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + encodePath(path);
}

async function adminRequest(path: string, init: RequestInit): Promise<Record<string, any>> {
  const response = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: { ...adminRequestHeaders(), ...(init.headers as Record<string, string> | undefined) },
  });
  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    /* not JSON */
  }
  if (!response.ok) {
    throw new Error(payload?.error || 'Could not save that change. Please try again.');
  }
  return payload || {};
}

function mediaPhoto(
  mediaById: Map<string, any>,
  id: string | null | undefined,
  alt: string,
): Photo | null {
  if (!id) return null;
  const row = mediaById.get(id);
  if (!row) return null;
  const url = publicUrl(row.storage_path);
  return {
    id: row.id,
    src: url,
    out: url,
    alt: alt || '',
    nat: { w: row.width || 1, h: row.height || 1 },
    crop: row.crop && row.crop.s != null ? row.crop : null,
    outW: row.width || undefined,
    outH: row.height || undefined,
  };
}

function splitPhoto(mediaById: Map<string, any>, row: any, fallbackAlt: string): Photo | null {
  return mediaPhoto(mediaById, row && row.media_id, (row && row.alt) || fallbackAlt);
}

function normalizeCrop(crop: any) {
  return crop && crop.s != null ? crop : null;
}

export async function loadAll(): Promise<AdminDb> {
  // Admin reads go through a service-role route: the anon key cannot see
  // draft/hidden rows, which the admin screens must list so they can be restored.
  const response = await fetch('/api/admin/data', { headers: adminRequestHeaders(), cache: 'no-store' });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || 'Could not load the admin content.');
  }
  const payload = (await response.json()) as {
    doctors: any[];
    facilities: any[];
    facility_images: any[];
    events: any[];
    event_images: any[];
    categories: any[];
    support: any[];
    media: any[];
  };
  const doctors = { data: payload.doctors || [] };
  const facilities = { data: payload.facilities || [] };
  const facilityImages = { data: payload.facility_images || [] };
  const events = { data: payload.events || [] };
  const eventImages = { data: payload.event_images || [] };
  const categories = { data: payload.categories || [] };
  const supportResult = { data: payload.support || [], error: null };
  const mediaRows = payload.media || [];

  const facilityImageRows: any[] = facilityImages.data || [];
  const eventImageRows: any[] = eventImages.data || [];
  const mediaById = new Map<string, any>();
  mediaRows.forEach((row: any) => mediaById.set(row.id, row));

  const facilityImagesBy = new Map<string, any[]>();
  facilityImageRows.forEach((image) => {
    const list = facilityImagesBy.get(image.facility_id) || [];
    list.push(image);
    facilityImagesBy.set(image.facility_id, list);
  });
  facilityImagesBy.forEach((list) => list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));

  const eventImagesBy = new Map<string, any[]>();
  eventImageRows.forEach((image) => {
    const list = eventImagesBy.get(image.event_id) || [];
    list.push(image);
    eventImagesBy.set(image.event_id, list);
  });
  eventImagesBy.forEach((list) => list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));

  const categoryRows = categories.data || [];
  const categoryFor = (kind: Collection): CategoryRecord[] =>
    categoryRows
      .filter((c: any) => c.kind === kind)
      .map((c: any) => ({
        id: c.id,
        kind,
        name: c.name,
        tagline: c.tagline || '',
        order: c.sort_order || 0,
      }));

  return {
    doctors: (doctors.data || []).map((row: any): DoctorRecord => ({
      id: row.id,
      name: row.name || '',
      role: row.designation || '',
      qual: row.qualifications || '',
      exp: row.experience || '',
      spec: row.speciality || '',
      schedule: row.schedule || '',
      location: row.location || '',
      bio: row.bio || '',
      days: Array.isArray(row.days) ? row.days : [],
      start: row.start_time ? String(row.start_time).slice(0, 5) : '',
      end: row.end_time ? String(row.end_time).slice(0, 5) : '',
      contact: row.contact || '',
      showContact: Boolean(row.show_contact),
      visible: row.status === 'published',
      photo: mediaPhoto(mediaById, row.image_id, row.image_alt || ''),
      order: row.sort_order || 0,
      status: row.status,
      updatedByName: row.updated_by_name || '',
      updatedByRole: row.updated_by_role || '',
      updatedAt: row.updated_at || '',
    })),
    facilities: (facilities.data || []).map((row: any): FacilityRecord => {
      const images = facilityImagesBy.get(row.id) || [];
      const storedCaptions = Array.isArray(row.slot_captions) ? row.slot_captions : [];
      const hasCaptions = storedCaptions.length >= 3;
      const slots: FacilitySlot[] = [0, 1, 2].map((index) => {
        const image = images.find((item) => (item.sort_order || 0) === index);
        return {
          caption: hasCaptions
            ? storedCaptions[index] || ''
            : storedCaptions[index] || (image && image.caption) || ['General view', 'Detail', 'In use'][index],
          photo: image ? splitPhoto(mediaById, image, '') : null,
        };
      });
      const more = images
        .filter((item) => (item.sort_order || 0) >= 3)
        .map((item) => splitPhoto(mediaById, item, '') as Photo)
        .filter(Boolean);
      return {
        id: row.id,
        name: row.name || '',
        section: row.category || '',
        desc: [row.short_description, row.full_description].filter(Boolean).join('\n\n'),
        visible: row.status === 'published',
        extra: Boolean(row.extra),
        slots: slots as [FacilitySlot, FacilitySlot, FacilitySlot],
        more,
        review: Boolean(row.needs_review),
        coverIndex: row.cover_index || 0,
        order: row.sort_order || 0,
        status: row.status,
        updatedByName: row.updated_by_name || '',
        updatedByRole: row.updated_by_role || '',
        updatedAt: row.updated_at || '',
      };
    }),
    events: (events.data || []).map((row: any): EventRecord => ({
      id: row.id,
      title: row.title || '',
      date: row.event_date || '',
      endDate: row.end_date || '',
      start: row.start_time ? String(row.start_time).slice(0, 5) : '',
      end: row.end_time ? String(row.end_time).slice(0, 5) : '',
      cat: row.category || '',
      loc: row.venue || '',
      desc: row.summary || '',
      description: row.description || '',
      organiser: row.organiser || '',
      highlights: row.highlights || '',
      status: row.status,
      featured: Boolean(row.featured),
      cover: mediaPhoto(mediaById, row.cover_id, row.cover_alt || ''),
      gallery: (eventImagesBy.get(row.id) || [])
        .map((item) => splitPhoto(mediaById, item, ''))
        .filter((photo): photo is Photo => Boolean(photo)),
      shotLabels: row.placeholder_slots || 0,
      order: row.sort_order || 0,
      updatedByName: row.updated_by_name || '',
      updatedByRole: row.updated_by_role || '',
      updatedAt: row.updated_at || '',
    })),
    support: supportResult.error
      ? []
      : (supportResult.data || []).map((row: any): SupportRecord => ({
          id: row.id,
          count: row.count || '',
          title: row.title || '',
          description: row.description || '',
          order: row.sort_order || 0,
        })),
    categories: {
      doctors: categoryFor('doctors'),
      facilities: categoryFor('facilities'),
      events: categoryFor('events'),
    },
  };
}

async function mediaIdFor(
  photo: Photo | null | undefined,
  preset: 'doctor' | 'facility' | 'event',
): Promise<string | null> {
  if (!photo) return null;
  if (photo.id && !photo.dirty) return photo.id;
  const data = photo.out;
  if (!data || !data.startsWith('data:')) return photo.id || null;

  const result = await adminRequest('/api/admin/media', {
    method: 'POST',
    body: JSON.stringify({
      dataUrl: data,
      preset,
      width: photo.outW || photo.nat.w || null,
      height: photo.outH || photo.nat.h || null,
      crop: normalizeCrop(photo.crop),
    }),
  });
  const id = typeof result.id === 'string' ? result.id : '';
  const url = typeof result.url === 'string' ? result.url : '';
  if (!id || !url) throw new Error('The photo could not be saved.');
  photo.id = id;
  photo.src = url;
  photo.out = url;
  photo.dirty = false;
  return id;
}

function syncPhoto(photo: Photo) {
  photo.dirty = false;
}

export async function saveDoctor(record: DoctorRecord): Promise<void> {
  const imageId = await mediaIdFor(record.photo, 'doctor');
  if (record.photo) syncPhoto(record.photo);
  await adminRequest('/api/admin/records', {
    method: 'POST',
    body: JSON.stringify({
      collection: 'doctors',
      record: {
        id: record.id,
        name: record.name || '',
        designation: record.role || '',
        speciality: record.spec || '',
        qualifications: record.qual || '',
        experience: record.exp || '',
        bio: record.bio || '',
        schedule: record.schedule || '',
        days: Array.isArray(record.days) ? record.days : [],
        start_time: record.start || null,
        end_time: record.end || null,
        location: record.location || '',
        contact: record.contact || '',
        show_contact: Boolean(record.showContact),
        image_id: imageId,
        image_alt: record.photo ? record.photo.alt || '' : '',
        sort_order: record.order || 0,
        status: record.status,
      },
    }),
  });
}

export async function saveFacility(record: FacilityRecord): Promise<void> {
  const images: Record<string, unknown>[] = [];
  for (let i = 0; i < 3; i++) {
    const slot = record.slots[i];
    if (!slot.photo) continue;
    const mediaId = await mediaIdFor(slot.photo, 'facility');
    if (!mediaId) continue;
    syncPhoto(slot.photo);
    images.push({
      media_id: mediaId,
      caption: slot.caption || '',
      alt: slot.photo.alt || '',
      sort_order: i,
    });
  }
  for (let i = 0; i < record.more.length; i++) {
    const photo = record.more[i];
    const mediaId = await mediaIdFor(photo, 'facility');
    if (!mediaId) continue;
    syncPhoto(photo);
    images.push({ media_id: mediaId, caption: '', alt: photo.alt || '', sort_order: 3 + i });
  }

  await adminRequest('/api/admin/records', {
    method: 'POST',
    body: JSON.stringify({
      collection: 'facilities',
      record: {
        id: record.id,
        name: record.name || '',
        category: record.section || '',
        subcategory: '',
        short_description: '',
        full_description: record.desc || '',
        subitems: [],
        cover_index: 0,
        needs_review: Boolean(record.review),
        extra: Boolean(record.extra),
        slot_captions: record.slots.map((slot) => slot.caption || ''),
        sort_order: record.order || 0,
        status: record.status,
      },
      images,
    }),
  });
}

export async function saveEvent(record: EventRecord): Promise<void> {
  const coverId = await mediaIdFor(record.cover, 'event');
  if (record.cover) syncPhoto(record.cover);

  const images: Record<string, unknown>[] = [];
  for (let i = 0; i < record.gallery.length; i++) {
    const photo = record.gallery[i];
    const mediaId = await mediaIdFor(photo, 'event');
    if (!mediaId) continue;
    syncPhoto(photo);
    images.push({ media_id: mediaId, caption: '', alt: photo.alt || '', sort_order: i });
  }

  await adminRequest('/api/admin/records', {
    method: 'POST',
    body: JSON.stringify({
      collection: 'events',
      record: {
        id: record.id,
        title: record.title || '',
        category: record.cat || '',
        event_date: record.date || null,
        end_date: record.endDate || null,
        start_time: record.start || null,
        end_time: record.end || null,
        venue: record.loc || '',
        summary: record.desc || '',
        description: record.description || '',
        organiser: record.organiser || '',
        highlights: record.highlights || '',
        cover_id: coverId,
        cover_alt: record.cover ? record.cover.alt || '' : '',
        placeholder_slots: 0,
        featured: Boolean(record.featured),
        sort_order: record.order || 0,
        status: record.status,
      },
      images,
    }),
  });
}

function isCollection(value: Collection | ManageKey): value is Collection {
  return value === 'doctors' || value === 'facilities' || value === 'events';
}

export async function deleteRow(collection: Collection | ManageKey, id: string): Promise<void> {
  const params = new URLSearchParams(
    isCollection(collection) ? { collection, id } : { key: collection, id },
  );
  await adminRequest(`/api/admin/${isCollection(collection) ? 'records' : 'manage'}?${params}`, {
    method: 'DELETE',
  });
}

export async function setStatus(collection: Collection, id: string, status: Status): Promise<void> {
  await adminRequest('/api/admin/records', {
    method: 'PATCH',
    body: JSON.stringify({ collection, id, status }),
  });
}

export async function updateOrder(
  collection: Collection | ManageKey,
  ordered: { id: string }[],
): Promise<void> {
  const collectionPath = isCollection(collection);
  await adminRequest(`/api/admin/${collectionPath ? 'records' : 'manage'}`, {
    method: 'PATCH',
    body: JSON.stringify({
      [collectionPath ? 'collection' : 'key']: collection,
      order: ordered.map((row) => row.id),
    }),
  });
}

const KEY_FOR_KIND: Record<Collection, ManageKey> = {
  doctors: 'specialties',
  facilities: 'sections',
  events: 'categories',
};

export async function addCategory(
  kind: Collection,
  name: string,
  tagline: string,
  order: number,
): Promise<CategoryRecord> {
  const record: CategoryRecord = {
    id: crypto.randomUUID(),
    kind,
    name,
    tagline,
    order,
  };
  await adminRequest('/api/admin/manage', {
    method: 'POST',
    body: JSON.stringify({ key: KEY_FOR_KIND[kind], record }),
  });
  return record;
}

export async function updateCategoryFields(
  before: CategoryRecord,
  patch: { name?: string; tagline?: string },
): Promise<void> {
  const name = patch.name !== undefined ? patch.name.trim() : before.name;
  if (!name) throw new Error('A name cannot be empty.');
  await adminRequest('/api/admin/manage', {
    method: 'PATCH',
    body: JSON.stringify({
      key: KEY_FOR_KIND[before.kind],
      id: before.id,
      patch,
    }),
  });
}

export async function restoreCategory(record: CategoryRecord): Promise<void> {
  await adminRequest('/api/admin/manage', {
    method: 'POST',
    body: JSON.stringify({ key: KEY_FOR_KIND[record.kind], record }),
  });
}

export async function addSupport(record: SupportRecord): Promise<void> {
  await adminRequest('/api/admin/manage', {
    method: 'POST',
    body: JSON.stringify({ key: 'support', record }),
  });
}

export async function updateSupportFields(
  id: string,
  patch: Partial<Pick<SupportRecord, 'count' | 'title' | 'description'>>,
): Promise<void> {
  if (!Object.keys(patch).length) return;
  await adminRequest('/api/admin/manage', {
    method: 'PATCH',
    body: JSON.stringify({ key: 'support', id, patch }),
  });
}

export async function restoreSupport(record: SupportRecord): Promise<void> {
  await addSupport(record);
}
