'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export type Row = Record<string, any>;
export type ContentTable = 'doctors' | 'facilities' | 'events';
export type Preset = 'doctor' | 'facility' | 'event';

export interface Profile {
  id: string;
  full_name: string;
  role: 'administrator' | 'editor';
}

interface AdminContextValue {
  loading: boolean;
  profile: Profile | null;
  email: string;
  settings: Row | null;
  categories: Row[];
  doctors: Row[];
  facilities: Row[];
  events: Row[];
  media: Row[];
  mediaUsage: Record<string, string[]>;
  team: Profile[];
  activity: Row[];
  canPublish: boolean;
  isAdmin: boolean;
  mediaUrl: (id?: string | null) => string | null;
  mediaById: (id?: string | null) => Row | undefined;
  refresh: () => Promise<void>;
  saveEntity: (table: ContentTable, values: Row, id?: string | null) => Promise<Row>;
  deleteEntity: (table: ContentTable, id: string, title: string) => Promise<void>;
  setStatus: (table: ContentTable, row: Row, status: 'draft' | 'published') => Promise<void>;
  reorder: (table: ContentTable, ids: string[]) => Promise<void>;
  uploadImage: (file: File, preset: Preset, crop: Row) => Promise<Row>;
  removeMedia: (id: string) => Promise<void>;
  addGalleryImage: (kind: 'facility' | 'event', ownerId: string, mediaId: string, caption?: string, alt?: string) => Promise<void>;
  removeGalleryImage: (kind: 'facility' | 'event', id: string) => Promise<void>;
  loadGallery: (kind: 'facility' | 'event', ownerId: string) => Promise<Row[]>;
  saveSettings: (values: Row) => Promise<void>;
  addCategory: (kind: string, name: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  inviteUser: (email: string, fullName: string, role: string) => Promise<string>;
  removeUser: (id: string) => Promise<void>;
  updateRole: (id: string, role: string) => Promise<void>;
  updateAccount: (fullName: string, password?: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const PRESETS: Record<Preset, [number, number]> = {
  doctor: [800, 800],
  facility: [1200, 900],
  event: [1200, 900],
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = url;
  });
}

export function drawCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  preset: Preset,
  crop: Row,
) {
  const [tw, th] = PRESETS[preset];
  const zoom = Math.max(1, Math.min(3, Number(crop.zoom) || 1));
  const x = Math.max(-1, Math.min(1, Number(crop.x) || 0));
  const y = Math.max(-1, Math.min(1, Number(crop.y) || 0));
  const scale = Math.max(tw / img.width, th / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = (tw - dw) / 2 + x * Math.max(0, (dw - tw) / 2);
  const dy = (th - dh) / 2 + y * Math.max(0, (dh - th) / 2);
  ctx.clearRect(0, 0, tw, th);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, tw, th);
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [settings, setSettings] = useState<Row | null>(null);
  const [categories, setCategories] = useState<Row[]>([]);
  const [doctors, setDoctors] = useState<Row[]>([]);
  const [facilities, setFacilities] = useState<Row[]>([]);
  const [events, setEvents] = useState<Row[]>([]);
  const [media, setMedia] = useState<Row[]>([]);
  const [mediaUsage, setMediaUsage] = useState<Record<string, string[]>>({});
  const [team, setTeam] = useState<Profile[]>([]);
  const [activity, setActivity] = useState<Row[]>([]);

  const isAdmin = profile?.role === 'administrator';
  const canPublish = Boolean(isAdmin || (profile && settings?.editors_can_publish));

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/admin/login');
      return;
    }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (!prof) {
      await supabase.auth.signOut();
      router.replace('/admin/login?error=no-profile');
      return;
    }
    setProfile(prof as Profile);
    setEmail(user.email || '');

    const [settingsRes, catRes, docRes, facRes, evtRes, mediaRes, teamRes, actRes, facImgRes, evtImgRes] = await Promise.all([
      supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('doctors').select('*').order('sort_order', { ascending: true }),
      supabase.from('facilities').select('*').order('sort_order', { ascending: true }),
      supabase.from('events').select('*').order('sort_order', { ascending: true }),
      supabase.from('media').select('*').order('uploaded_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('activity_log').select('*').order('at', { ascending: false }).limit(150),
      supabase.from('facility_images').select('*').order('sort_order', { ascending: true }),
      supabase.from('event_images').select('*').order('sort_order', { ascending: true }),
    ]);
    const facImages = new Map<string, Row[]>();
    (facImgRes.data || []).forEach((img: Row) => {
      const list = facImages.get(img.facility_id) || [];
      list.push(img);
      facImages.set(img.facility_id, list);
    });
    const evtCover = new Map<string, string>();
    (evtImgRes.data || []).forEach((img: Row) => {
      if (!evtCover.has(img.event_id)) evtCover.set(img.event_id, img.media_id);
    });
    const usage: Record<string, string[]> = {};
    const addUse = (mediaId: string | null | undefined, label: string) => {
      if (!mediaId) return;
      (usage[mediaId] = usage[mediaId] || []).push(label);
    };
    const facNames = new Map<string, string>((facRes.data || []).map((f: Row) => [f.id, f.name]));
    const evtNames = new Map<string, string>((evtRes.data || []).map((e: Row) => [e.id, e.title]));
    (docRes.data || []).forEach((d: Row) => addUse(d.image_id, `Doctor: ${d.name}`));
    (evtRes.data || []).forEach((e: Row) => addUse(e.cover_id, `Event: ${evtNames.get(e.id) || e.title}`));
    (facImgRes.data || []).forEach((img: Row) => addUse(img.media_id, `Facility: ${facNames.get(img.facility_id) || ''}`));
    (evtImgRes.data || []).forEach((img: Row) => addUse(img.media_id, `Event: ${evtNames.get(img.event_id) || ''}`));
    setMediaUsage(usage);
    setSettings(settingsRes.data || null);
    setCategories(catRes.data || []);
    setDoctors(docRes.data || []);
    setFacilities(
      (facRes.data || []).map((f: Row) => {
        const images = facImages.get(f.id) || [];
        const cover = images[f.cover_index || 0] || images[0];
        return { ...f, cover_media_id: cover?.media_id || null };
      }),
    );
    setEvents((evtRes.data || []).map((e: Row) => ({ ...e, cover_media_id: e.cover_id || evtCover.get(e.id) || null })));
    setMedia(mediaRes.data || []);
    setTeam((teamRes.data || []) as Profile[]);
    setActivity(actRes.data || []);
    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mediaById = useCallback((id?: string | null) => media.find((m) => m.id === id), [media]);
  const mediaUrl = useCallback(
    (id?: string | null) => {
      const row = media.find((m) => m.id === id);
      if (!row?.storage_path) return null;
      return supabase.storage.from('media').getPublicUrl(row.storage_path).data.publicUrl;
    },
    [media, supabase],
  );

  const log = useCallback(
    async (action: string, entityType: string, entityTitle: string) => {
      await supabase.from('activity_log').insert({
        actor: profile?.id || null,
        actor_name: profile?.full_name || '',
        action,
        entity_type: entityType,
        entity_title: entityTitle,
      });
    },
    [profile, supabase],
  );

  const revalidate = useCallback(async () => {
    try {
      await fetch('/api/revalidate', { method: 'POST' });
    } catch {
      // The save already succeeded; a stale page will refresh on the next revalidation.
    }
  }, []);

  const saveEntity = useCallback(
    async (table: ContentTable, values: Row, id?: string | null) => {
      const payload = { ...values };
      if (id) payload.id = id;
      const query = id
        ? supabase.from(table).update(payload).eq('id', id).select().single()
        : supabase.from(table).insert(payload).select().single();
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      await log(id ? 'Updated' : 'Added', table, payload.name || payload.title || '');
      await refresh();
      await revalidate();
      return data as Row;
    },
    [log, refresh, revalidate, supabase],
  );

  const setStatus = useCallback(
    async (table: ContentTable, row: Row, status: 'draft' | 'published') => {
      const { error } = await supabase.from(table).update({ status }).eq('id', row.id);
      if (error) throw new Error(error.message);
      await log(status === 'published' ? 'Published' : 'Unpublished', table, row.name || row.title || '');
      await refresh();
      await revalidate();
    },
    [log, refresh, revalidate, supabase],
  );

  const deleteEntity = useCallback(
    async (table: ContentTable, id: string, title: string) => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
      await log('Deleted', table, title);
      await refresh();
      await revalidate();
    },
    [log, refresh, revalidate, supabase],
  );

  const reorder = useCallback(
    async (table: ContentTable, ids: string[]) => {
      await Promise.all(ids.map((id, index) => supabase.from(table).update({ sort_order: index + 1 }).eq('id', id)));
      await log('Reordered', table, `${ids.length} items`);
      await refresh();
      await revalidate();
    },
    [log, refresh, revalidate, supabase],
  );

  const uploadImage = useCallback(
    async (file: File, preset: Preset, crop: Row) => {
      if (!file.type.match(/^image\/(jpeg|png|webp)$/)) throw new Error('Choose a JPG, PNG or WebP image.');
      if (file.size > 5 * 1024 * 1024) throw new Error('That image is larger than 5 MB. Please choose a smaller file.');
      const img = await loadImage(file);
      const [tw, th] = PRESETS[preset];
      const canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Your browser could not prepare the image.');
      drawCrop(ctx, img, preset, crop);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86));
      if (!blob) throw new Error('The image could not be processed.');

      const id = crypto.randomUUID();
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const croppedPath = `${preset}/${id}.jpg`;
      const originalPath = `${preset}/originals/${id}.${ext}`;

      const originalUpload = await supabase.storage.from('media').upload(originalPath, file, {
        contentType: file.type,
        upsert: false,
      });
      if (originalUpload.error) throw new Error(originalUpload.error.message);

      const croppedUpload = await supabase.storage.from('media').upload(croppedPath, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (croppedUpload.error) throw new Error(croppedUpload.error.message);

      const { data, error } = await supabase
        .from('media')
        .insert({
          file_name: file.name,
          storage_path: croppedPath,
          original_path: originalPath,
          width: tw,
          height: th,
          size_bytes: blob.size,
          mime_type: 'image/jpeg',
          preset,
          crop,
          uploaded_by: profile?.id || null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      await log('Uploaded image', 'Media', file.name);
      await refresh();
      return data as Row;
    },
    [log, profile, refresh, supabase],
  );

  const removeMedia = useCallback(
    async (id: string) => {
      const row = media.find((m) => m.id === id);
      if (!row) return;
      const paths = [row.storage_path, row.original_path].filter(Boolean) as string[];
      if (paths.length) await supabase.storage.from('media').remove(paths);
      const { error } = await supabase.from('media').delete().eq('id', id);
      if (error) throw new Error(error.message);
      await log('Deleted image', 'Media', row.file_name);
      await refresh();
      await revalidate();
    },
    [log, media, refresh, revalidate, supabase],
  );

  const addGalleryImage = useCallback(
    async (kind: 'facility' | 'event', ownerId: string, mediaId: string, caption = '', alt = '') => {
      const table = kind === 'facility' ? 'facility_images' : 'event_images';
      const column = kind === 'facility' ? 'facility_id' : 'event_id';
      const existing = await supabase.from(table).select('sort_order').eq(column, ownerId).order('sort_order', { ascending: false }).limit(1);
      const next = (existing.data?.[0]?.sort_order || 0) + 1;
      const { error } = await supabase.from(table).insert({
        [column]: ownerId,
        media_id: mediaId,
        caption,
        alt,
        sort_order: next,
      });
      if (error) throw new Error(error.message);
      await log('Uploaded image', kind === 'facility' ? 'Facilities' : 'Events', caption || '');
      await refresh();
      await revalidate();
    },
    [log, refresh, revalidate, supabase],
  );

  const removeGalleryImage = useCallback(
    async (kind: 'facility' | 'event', id: string) => {
      const table = kind === 'facility' ? 'facility_images' : 'event_images';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw new Error(error.message);
      await log('Removed image', kind === 'facility' ? 'Facilities' : 'Events', '');
      await refresh();
      await revalidate();
    },
    [log, refresh, revalidate, supabase],
  );

  const loadGallery = useCallback(
    async (kind: 'facility' | 'event', ownerId: string) => {
      const table = kind === 'facility' ? 'facility_images' : 'event_images';
      const column = kind === 'facility' ? 'facility_id' : 'event_id';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(column, ownerId)
        .order('sort_order', { ascending: true });
      if (error) throw new Error(error.message);
      return (data || []) as Row[];
    },
    [supabase],
  );

  const saveSettings = useCallback(
    async (values: Row) => {
      const { error } = await supabase.from('settings').update(values).eq('id', 1);
      if (error) throw new Error(error.message);
      await log('Updated settings', 'Settings', 'Publishing permissions');
      await refresh();
    },
    [log, refresh, supabase],
  );

  const addCategory = useCallback(
    async (kind: string, name: string) => {
      const existing = categories.filter((c) => c.kind === kind);
      const { error } = await supabase.from('categories').insert({
        kind,
        name: name.trim(),
        sort_order: existing.length + 1,
      });
      if (error) throw new Error(error.message);
      await log('Added category', 'Settings', name);
      await refresh();
    },
    [categories, log, refresh, supabase],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      const row = categories.find((c) => c.id === id);
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
      await log('Removed category', 'Settings', row?.name || '');
      await refresh();
    },
    [categories, log, refresh, supabase],
  );

  const inviteUser = useCallback(
    async (email: string, fullName: string, role: string) => {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, fullName, role }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'The invitation could not be sent.');
      await refresh();
      return body.message as string;
    },
    [refresh],
  );

  const removeUser = useCallback(
    async (id: string) => {
      const res = await fetch('/api/admin/team', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'The account could not be removed.');
      await refresh();
    },
    [refresh],
  );

  const updateRole = useCallback(
    async (id: string, role: string) => {
      const row = team.find((t) => t.id === id);
      const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
      if (error) throw new Error(error.message);
      await log('Updated user', 'Team', row?.full_name || '');
      await refresh();
    },
    [log, refresh, supabase, team],
  );

  const updateAccount = useCallback(
    async (fullName: string, password?: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);
      if (profileError) throw new Error(profileError.message);
      if (password) {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw new Error(authError.message);
      }
      await log('Updated account', 'Settings', user.email || fullName);
      await refresh();
    },
    [log, refresh, supabase],
  );

  const value: AdminContextValue = {
    loading,
    profile,
    email,
    settings,
    categories,
    doctors,
    facilities,
    events,
    media,
    mediaUsage,
    team,
    activity,
    canPublish,
    isAdmin,
    mediaUrl,
    mediaById,
    refresh,
    saveEntity,
    deleteEntity,
    setStatus,
    reorder,
    uploadImage,
    removeMedia,
    addGalleryImage,
    removeGalleryImage,
    loadGallery,
    saveSettings,
    addCategory,
    removeCategory,
    inviteUser,
    removeUser,
    updateRole,
    updateAccount,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
