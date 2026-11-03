import 'server-only';

import { createServerSupabase } from './supabase/server';

export type ContentStatus = 'draft' | 'published';

export interface PublicDoctor {
  id: string;
  name: string;
  designation: string;
  speciality: string;
  qualifications: string;
  experience: string;
  bio: string;
  schedule: string;
  days: string[];
  start: string;
  end: string;
  location: string;
  contact: string;
  showContact: boolean;
  imageUrl: string | null;
  imageAlt: string;
  sortOrder: number;
  status: ContentStatus;
}

export interface PublicGalleryImage {
  id: string;
  mediaId: string;
  url: string;
  caption: string;
  alt: string;
  sortOrder: number;
}

export interface PublicFacility {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  fullDescription: string;
  subitems: { name: string; text: string }[];
  coverIndex: number;
  coverImageUrl: string | null;
  images: PublicGalleryImage[];
  needsReview: boolean;
  sortOrder: number;
  status: ContentStatus;
}

export interface PublicEvent {
  id: string;
  title: string;
  category: string;
  eventDate: string | null;
  endDate: string | null;
  start: string;
  end: string;
  venue: string;
  summary: string;
  description: string;
  organiser: string;
  highlights: string;
  coverImageUrl: string | null;
  coverAlt: string;
  gallery: PublicGalleryImage[];
  placeholderSlots: number;
  sortOrder: number;
  status: ContentStatus;
}

export interface PublicSupportRow {
  id: string;
  title: string;
  count: string;
  description: string;
  sortOrder: number;
}

export interface PublicCategory {
  id: string;
  name: string;
  tagline: string;
  sortOrder: number;
}

export interface ContentResult<T> {
  rows: T[];
  preview: boolean;
  error: string | null;
}

function mediaUrl(supabase: Awaited<ReturnType<typeof createServerSupabase>>, path?: string | null) {
  if (!path) return null;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}

export async function getStaffPreview(): Promise<boolean> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    return Boolean(profile);
  } catch {
    return false;
  }
}

export async function getCategories(kind: 'doctors' | 'facilities' | 'events') {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('categories')
      .select('name, sort_order')
      .eq('kind', kind)
      .order('sort_order', { ascending: true });
    return (data || []).map((c) => c.name as string);
  } catch {
    return [] as string[];
  }
}

export async function getCategoryRecords(
  kind: 'doctors' | 'facilities' | 'events',
): Promise<PublicCategory[]> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('kind', kind)
      .order('sort_order', { ascending: true });
    return (data || []).map((c) => ({
      id: c.id as string,
      name: (c.name as string) || '',
      tagline: (c.tagline as string) || '',
      sortOrder: (c.sort_order as number) || 0,
    }));
  } catch {
    return [];
  }
}

export async function getSupportStaff(): Promise<PublicSupportRow[] | null> {
  try {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from('support_staff')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id as string,
      title: (r.title as string) || '',
      count: (r.count as string) || '',
      description: (r.description as string) || '',
      sortOrder: (r.sort_order as number) || 0,
    }));
  } catch {
    return null;
  }
}

export async function getDoctors(preview = false): Promise<ContentResult<PublicDoctor>> {
  const showDrafts = preview && (await getStaffPreview());
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('doctors').select('*').order('sort_order', { ascending: true });
    if (!showDrafts) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const imageIds = rows.map((r) => r.image_id).filter(Boolean);
    const images = new Map<string, { path: string; alt: string }>();
    if (imageIds.length) {
      const { data: media } = await supabase
        .from('media')
        .select('id, storage_path')
        .in('id', imageIds);
      (media || []).forEach((m) => images.set(m.id, { path: m.storage_path, alt: '' }));
    }

    return {
      preview: showDrafts,
      error: null,
      rows: rows.map((r) => ({
        id: r.id,
        name: r.name,
        designation: r.designation || '',
        speciality: r.speciality,
        qualifications: r.qualifications || '',
        experience: r.experience || '',
        bio: r.bio || '',
        schedule: r.schedule || '',
        days: r.days || [],
        start: r.start_time || '',
        end: r.end_time || '',
        location: r.location || '',
        contact: r.contact || '',
        showContact: Boolean(r.show_contact),
        imageUrl: mediaUrl(supabase, images.get(r.image_id)?.path),
        imageAlt: r.image_alt || '',
        sortOrder: r.sort_order || 0,
        status: r.status,
      })),
    };
  } catch (error) {
    return { rows: [], preview: showDrafts, error: (error as Error).message };
  }
}

export async function getFacilities(preview = false): Promise<ContentResult<PublicFacility>> {
  const showDrafts = preview && (await getStaffPreview());
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('facilities').select('*').order('sort_order', { ascending: true });
    if (!showDrafts) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const ids = rows.map((r) => r.id);
    const grouped = new Map<string, PublicGalleryImage[]>();
    if (ids.length) {
      const { data: links } = await supabase
        .from('facility_images')
        .select('*, media(*)')
        .in('facility_id', ids)
        .order('sort_order', { ascending: true });
      (links || []).forEach((l) => {
        const list = grouped.get(l.facility_id) || [];
        list.push({
          id: l.id,
          mediaId: l.media_id,
          url: mediaUrl(supabase, l.media?.storage_path) || '',
          caption: l.caption || '',
          alt: l.alt || '',
          sortOrder: l.sort_order || 0,
        });
        grouped.set(l.facility_id, list);
      });
    }

    const categories = await getCategories('facilities');
    const order = new Map(categories.map((c, i) => [c, i]));

    return {
      preview: showDrafts,
      error: null,
      rows: rows
        .map((r) => {
          const images = grouped.get(r.id) || [];
          const cover = images[r.cover_index || 0] || images[0];
          return {
            id: r.id,
            name: r.name,
            category: r.category,
            subcategory: r.subcategory || '',
            shortDescription: r.short_description || '',
            fullDescription: r.full_description || '',
            subitems: Array.isArray(r.subitems) ? r.subitems : [],
            coverIndex: r.cover_index || 0,
            coverImageUrl: cover?.url || null,
            images,
            needsReview: Boolean(r.needs_review),
            sortOrder: r.sort_order || 0,
            status: r.status,
          };
        })
        .sort(
          (a, b) =>
            (order.get(a.category) ?? 999) - (order.get(b.category) ?? 999) ||
            a.sortOrder - b.sortOrder,
        ),
    };
  } catch (error) {
    return { rows: [], preview: showDrafts, error: (error as Error).message };
  }
}

export async function getEvents(preview = false): Promise<ContentResult<PublicEvent>> {
  const showDrafts = preview && (await getStaffPreview());
  try {
    const supabase = await createServerSupabase();
    let query = supabase.from('events').select('*').order('sort_order', { ascending: true });
    if (!showDrafts) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const ids = rows.map((r) => r.id);
    const grouped = new Map<string, PublicGalleryImage[]>();
    if (ids.length) {
      const { data: links } = await supabase
        .from('event_images')
        .select('*, media(*)')
        .in('event_id', ids)
        .order('sort_order', { ascending: true });
      (links || []).forEach((l) => {
        const list = grouped.get(l.event_id) || [];
        list.push({
          id: l.id,
          mediaId: l.media_id,
          url: mediaUrl(supabase, l.media?.storage_path) || '',
          caption: l.caption || '',
          alt: l.alt || '',
          sortOrder: l.sort_order || 0,
        });
        grouped.set(l.event_id, list);
      });
    }

    const coverIds = rows.map((r) => r.cover_id).filter(Boolean);
    const covers = new Map<string, string>();
    if (coverIds.length) {
      const { data: media } = await supabase
        .from('media')
        .select('id, storage_path')
        .in('id', coverIds);
      (media || []).forEach((m) => covers.set(m.id, mediaUrl(supabase, m.storage_path) || ''));
    }

    return {
      preview: showDrafts,
      error: null,
      rows: rows.map((r) => {
        const gallery = grouped.get(r.id) || [];
        return {
          id: r.id,
          title: r.title,
          category: r.category,
          eventDate: r.event_date,
          endDate: r.end_date,
          start: r.start_time || '',
          end: r.end_time || '',
          venue: r.venue || '',
          summary: r.summary || '',
          description: r.description || '',
          organiser: r.organiser || '',
          highlights: r.highlights || '',
          coverImageUrl: covers.get(r.cover_id) || gallery[0]?.url || null,
          coverAlt: r.cover_alt || '',
          gallery,
          placeholderSlots: r.placeholder_slots || 0,
          sortOrder: r.sort_order || 0,
          status: r.status,
        };
      }),
    };
  } catch (error) {
    return { rows: [], preview: showDrafts, error: (error as Error).message };
  }
}

export function sortUpcoming(events: PublicEvent[]) {
  const today = new Date().toISOString().slice(0, 10);
  return [...events].sort((a, b) => {
    const ad = a.eventDate || '';
    const bd = b.eventDate || '';
    const au = ad >= today ? 0 : 1;
    const bu = bd >= today ? 0 : 1;
    if (au !== bu) return au - bu;
    return au === 0 ? ad.localeCompare(bd) : bd.localeCompare(ad);
  });
}
