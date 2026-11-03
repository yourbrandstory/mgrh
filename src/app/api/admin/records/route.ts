import { NextResponse } from 'next/server';
import {
  COLLECTION_TABLE,
  HttpError,
  actorFromRequest,
  asCollection,
  asId,
  asStatus,
  errorResponse,
  insertOrUpsert,
  logActivity,
  revalidateSite,
  recordTitle,
  requireAdmin,
  service,
  updateById,
} from '@/lib/admin/server-api';
import type { Collection } from '@/lib/admin/types';

const FIELDS: Record<Collection, string[]> = {
  doctors: [
    'id',
    'name',
    'designation',
    'speciality',
    'qualifications',
    'experience',
    'bio',
    'schedule',
    'days',
    'start_time',
    'end_time',
    'location',
    'contact',
    'show_contact',
    'image_id',
    'image_alt',
    'sort_order',
    'status',
  ],
  facilities: [
    'id',
    'name',
    'category',
    'subcategory',
    'short_description',
    'full_description',
    'subitems',
    'cover_index',
    'needs_review',
    'extra',
    'slot_captions',
    'sort_order',
    'status',
  ],
  events: [
    'id',
    'title',
    'category',
    'event_date',
    'end_date',
    'start_time',
    'end_time',
    'venue',
    'summary',
    'description',
    'organiser',
    'highlights',
    'cover_id',
    'cover_alt',
    'placeholder_slots',
    'featured',
    'sort_order',
    'status',
  ],
};

const CHILDREN: Partial<Record<Collection, { table: string; column: string }>> = {
  facilities: { table: 'facility_images', column: 'facility_id' },
  events: { table: 'event_images', column: 'event_id' },
};

function pick(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in source) row[key] = source[key];
  }
  return row;
}

function titleOf(collection: Collection, row: Record<string, unknown>): string {
  const value = collection === 'events' ? row.title : row.name;
  return typeof value === 'string' ? value : '';
}

async function replaceImages(
  collection: Collection,
  id: string,
  images: unknown,
): Promise<void> {
  const child = CHILDREN[collection];
  if (!child) return;
  const { error: clearError } = await service()
    .from(child.table)
    .delete()
    .eq(child.column, id);
  if (clearError) throw new HttpError(400, clearError.message);

  if (!Array.isArray(images) || !images.length) return;
  const rows = images
    .filter((image): image is Record<string, unknown> => Boolean(image) && typeof image === 'object')
    .map((image, index) => ({
      [child.column]: id,
      media_id: String(image.media_id || ''),
      caption: typeof image.caption === 'string' ? image.caption : '',
      alt: typeof image.alt === 'string' ? image.alt : '',
      sort_order: Number.isFinite(Number(image.sort_order)) ? Number(image.sort_order) : index,
    }))
    .filter((image) => image.media_id);
  if (!rows.length) return;
  const { error } = await service().from(child.table).insert(rows);
  if (error) throw new HttpError(400, error.message);
}

export async function POST(request: Request) {
  try {
    const actor = actorFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const collection = asCollection(body.collection);
    const source = body.record;
    if (!source || typeof source !== 'object') {
      throw new HttpError(400, 'No record was sent.');
    }
    const record = source as Record<string, unknown>;
    const id = asId(record.id);
    const row = pick(record, FIELDS[collection]);
    row.id = id;
    if ('status' in row) row.status = asStatus(row.status);

    const existing = await service()
      .from(COLLECTION_TABLE[collection])
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (existing.error) throw new HttpError(400, existing.error.message);

    await insertOrUpsert(COLLECTION_TABLE[collection], row, actor);
    await replaceImages(collection, id, body.images);
    await logActivity(
      actor,
      existing.data ? 'Updated' : 'Added',
      COLLECTION_TABLE[collection],
      id,
      titleOf(collection, row),
    );
    revalidateSite();
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = actorFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const collection = asCollection(body.collection);
    const table = COLLECTION_TABLE[collection];

    if (Array.isArray(body.order)) {
      for (let index = 0; index < body.order.length; index++) {
        const id = asId(body.order[index]);
        await updateById(table, id, { sort_order: index }, actor);
      }
      await logActivity(actor, 'Reordered', table, null, table);
      revalidateSite();
      return NextResponse.json({ ok: true });
    }

    const id = asId(body.id);
    const status = asStatus(body.status);
    await updateById(table, id, { status }, actor);
    const title =
      typeof body.name === 'string' && body.name.trim()
        ? body.name.trim()
        : await recordTitle(collection, id);
    await logActivity(actor, status === 'published' ? 'Published' : 'Hidden', table, id, title);
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = actorFromRequest(request);
    requireAdmin(actor);
    const url = new URL(request.url);
    const collection = asCollection(url.searchParams.get('collection'));
    const id = asId(url.searchParams.get('id'));
    const table = COLLECTION_TABLE[collection];
    const title = await recordTitle(collection, id);

    const child = CHILDREN[collection];
    if (child) {
      const { error } = await service().from(child.table).delete().eq(child.column, id);
      if (error) throw new HttpError(400, error.message);
    }
    const { error } = await service().from(table).delete().eq('id', id);
    if (error) throw new HttpError(400, error.message);

    await logActivity(actor, 'Deleted', table, id, title);
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
