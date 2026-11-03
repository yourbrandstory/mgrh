import 'server-only';

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';
import type { AdminRole, Collection, ManageKey } from './types';

export interface Actor {
  name: string;
  role: AdminRole;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const COLLECTION_TABLE: Record<Collection, string> = {
  doctors: 'doctors',
  facilities: 'facilities',
  events: 'events',
};

export const MANAGE_TABLE: Record<ManageKey, string> = {
  specialties: 'categories',
  categories: 'categories',
  sections: 'categories',
  support: 'support_staff',
};

export const CATEGORY_KIND: Record<Exclude<ManageKey, 'support'>, Collection> = {
  specialties: 'doctors',
  categories: 'events',
  sections: 'facilities',
};

export function actorFromRequest(request: Request): Actor {
  const rawName = request.headers.get('x-admin-name');
  const rawRole = request.headers.get('x-admin-role');
  if (!rawName || !rawRole) throw new HttpError(401, 'Sign in to make changes.');

  let name = rawName;
  try {
    name = decodeURIComponent(rawName);
  } catch {
    /* keep the raw value */
  }
  name = name.trim();
  if (!name) throw new HttpError(401, 'Sign in to make changes.');
  if (rawRole !== 'Admin' && rawRole !== 'Editor') {
    throw new HttpError(403, 'That role cannot make changes.');
  }
  return { name, role: rawRole };
}

export function requireAdmin(actor: Actor): void {
  if (actor.role !== 'Admin') throw new HttpError(403, 'Editors cannot delete.');
}

export function service() {
  return createServiceSupabase();
}

export function asCollection(value: unknown): Collection {
  if (value === 'doctors' || value === 'facilities' || value === 'events') return value;
  throw new HttpError(400, 'Unknown content collection.');
}

export function asManageKey(value: unknown): ManageKey {
  if (
    value === 'specialties' ||
    value === 'categories' ||
    value === 'sections' ||
    value === 'support'
  ) {
    return value;
  }
  throw new HttpError(400, 'Unknown list.');
}

export function asId(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, 'Missing record id.');
  return value.trim();
}

export function asStatus(value: unknown): 'published' | 'draft' {
  if (value === 'published' || value === 'draft') return value;
  throw new HttpError(400, 'Unknown publish status.');
}

export function isMissingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    /column .* does not exist|could not find the .* column/i.test(error.message || '')
  );
}

function auditFields(actor: Actor) {
  return {
    updated_by_name: actor.name,
    updated_by_role: actor.role,
    updated_at: new Date().toISOString(),
  };
}

export async function insertOrUpsert(
  table: string,
  row: Record<string, unknown>,
  actor: Actor,
): Promise<void> {
  const client = service();
  let { error } = await client
    .from(table)
    .upsert({ ...row, ...auditFields(actor) }, { onConflict: 'id' });
  if (error && isMissingColumn(error)) {
    ({ error } = await client.from(table).upsert(row, { onConflict: 'id' }));
  }
  if (error) throw new HttpError(400, error.message);
}

export async function updateById(
  table: string,
  id: string,
  patch: Record<string, unknown>,
  actor: Actor,
): Promise<void> {
  const client = service();
  let { error } = await client
    .from(table)
    .update({ ...patch, ...auditFields(actor) })
    .eq('id', id);
  if (error && isMissingColumn(error)) {
    ({ error } = await client.from(table).update(patch).eq('id', id));
  }
  if (error) throw new HttpError(400, error.message);
}

export async function updateWhere(
  table: string,
  column: string,
  value: string,
  patch: Record<string, unknown>,
  actor: Actor,
): Promise<void> {
  const client = service();
  let { error } = await client
    .from(table)
    .update({ ...patch, ...auditFields(actor) })
    .eq(column, value);
  if (error && isMissingColumn(error)) {
    ({ error } = await client.from(table).update(patch).eq(column, value));
  }
  if (error) throw new HttpError(400, error.message);
}

export async function logActivity(
  actor: Actor,
  action: string,
  table: string,
  recordId: string | null,
  recordTitle: string,
): Promise<void> {
  const client = service();
  const base = {
    actor_name: actor.name,
    action,
    entity_type: table,
    entity_title: recordTitle || '',
  };
  let { error } = await client
    .from('activity_log')
    .insert({ ...base, actor_role: actor.role, entity_id: recordId });
  if (error && isMissingColumn(error)) {
    ({ error } = await client.from('activity_log').insert(base));
  }
  if (error) console.error('MGRH activity log could not be written.', error.message);
}

export async function recordTitle(
  collection: Collection,
  id: string,
): Promise<string> {
  const column = collection === 'events' ? 'title' : 'name';
  const { data } = await service()
    .from(COLLECTION_TABLE[collection])
    .select(column)
    .eq('id', id)
    .maybeSingle();
  const row = data as Record<string, unknown> | null;
  return row && typeof row[column] === 'string' ? (row[column] as string) : '';
}

export async function manageTitle(key: ManageKey, id: string): Promise<string> {
  const column = key === 'support' ? 'title' : 'name';
  const { data } = await service()
    .from(MANAGE_TABLE[key])
    .select(column)
    .eq('id', id)
    .maybeSingle();
  const row = data as Record<string, unknown> | null;
  return row && typeof row[column] === 'string' ? (row[column] as string) : '';
}

export function revalidateSite(): void {
  for (const path of ['/', '/doctors', '/facilities', '/events']) {
    revalidatePath(path);
  }
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error('MGRH admin write failed.', error);
  return NextResponse.json(
    { error: 'Could not save that change. Please try again.' },
    { status: 500 },
  );
}
