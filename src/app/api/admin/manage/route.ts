import { NextResponse } from 'next/server';
import {
  CATEGORY_KIND,
  HttpError,
  MANAGE_TABLE,
  actorFromRequest,
  asId,
  asManageKey,
  errorResponse,
  logActivity,
  manageTitle,
  revalidateSite,
  requireAdmin,
  service,
  updateWhere,
} from '@/lib/admin/server-api';
import type { ManageKey } from '@/lib/admin/types';

function supportRow(record: Record<string, unknown>, id: string) {
  return {
    id,
    title: typeof record.title === 'string' ? record.title : '',
    count: typeof record.count === 'string' ? record.count : '',
    description: typeof record.description === 'string' ? record.description : '',
    sort_order: Number.isFinite(Number(record.order)) ? Number(record.order) : 0,
  };
}

function categoryRow(
  key: Exclude<ManageKey, 'support'>,
  record: Record<string, unknown>,
  id: string,
) {
  const row: Record<string, unknown> = {
    id,
    kind: CATEGORY_KIND[key],
    name: typeof record.name === 'string' ? record.name.trim() : '',
    sort_order: Number.isFinite(Number(record.order)) ? Number(record.order) : 0,
  };
  if (typeof record.tagline === 'string' && record.tagline.trim()) {
    row.tagline = record.tagline.trim();
  }
  return row;
}

export async function POST(request: Request) {
  try {
    const actor = actorFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const key = asManageKey(body.key);
    if (!body.record || typeof body.record !== 'object') {
      throw new HttpError(400, 'No record was sent.');
    }
    const record = body.record as Record<string, unknown>;
    const id = asId(record.id);

    if (key === 'support') {
      const existing = await service().from('support_staff').select('id').eq('id', id).maybeSingle();
      if (existing.error) throw new HttpError(400, existing.error.message);
      const row = supportRow(record, id);
      const { error } = await service().from('support_staff').upsert(row, { onConflict: 'id' });
      if (error) throw new HttpError(400, error.message);
      await logActivity(
        actor,
        existing.data ? 'Updated' : 'Added',
        'support_staff',
        id,
        row.title,
      );
    } else {
      const table = MANAGE_TABLE[key];
      const existing = await service().from(table).select('id').eq('id', id).maybeSingle();
      if (existing.error) throw new HttpError(400, existing.error.message);
      const row = categoryRow(key, record, id);
      if (!row.name) throw new HttpError(400, 'A name cannot be empty.');
      const { error } = await service().from(table).upsert(row, { onConflict: 'id' });
      if (error) throw new HttpError(400, error.message);
      await logActivity(
        actor,
        existing.data ? 'Updated' : 'Added',
        table,
        id,
        String(row.name),
      );
    }

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
    const key = asManageKey(body.key);
    const table = MANAGE_TABLE[key];

    if (Array.isArray(body.order)) {
      for (let index = 0; index < body.order.length; index++) {
        const id = asId(body.order[index]);
        const { error } = await service()
          .from(table)
          .update({ sort_order: index })
          .eq('id', id);
        if (error) throw new HttpError(400, error.message);
      }
      await logActivity(actor, 'Reordered', table, null, table);
      revalidateSite();
      return NextResponse.json({ ok: true });
    }

    const id = asId(body.id);
    if (!body.patch || typeof body.patch !== 'object') {
      throw new HttpError(400, 'No changes were sent.');
    }
    const patch = body.patch as Record<string, unknown>;

    if (key === 'support') {
      const next: Record<string, string> = {};
      for (const field of ['count', 'title', 'description'] as const) {
        if (field in patch) {
          if (typeof patch[field] !== 'string') throw new HttpError(400, 'Invalid value.');
          next[field] = patch[field];
        }
      }
      if (!Object.keys(next).length) return NextResponse.json({ ok: true });
      const title = await manageTitle(key, id);
      const { error } = await service().from(table).update(next).eq('id', id);
      if (error) throw new HttpError(400, error.message);
      await logActivity(actor, 'Updated', table, id, next.title ?? title);
    } else {
      const { data: current, error: readError } = await service()
        .from(table)
        .select('name')
        .eq('id', id)
        .maybeSingle();
      if (readError) throw new HttpError(400, readError.message);
      if (!current) throw new HttpError(404, 'That item no longer exists.');

      const oldName = typeof current.name === 'string' ? current.name : '';
      const next: Record<string, string> = {};
      if ('name' in patch) {
        if (typeof patch.name !== 'string' || !patch.name.trim()) {
          throw new HttpError(400, 'A name cannot be empty.');
        }
        next.name = patch.name.trim();
      }
      if ('tagline' in patch) {
        if (typeof patch.tagline !== 'string') throw new HttpError(400, 'Invalid value.');
        next.tagline = patch.tagline.trim();
      }
      if (!Object.keys(next).length) return NextResponse.json({ ok: true });

      const { error } = await service().from(table).update(next).eq('id', id);
      if (error) throw new HttpError(400, error.message);

      if (next.name && next.name !== oldName) {
        if (key === 'specialties') {
          await updateWhere('doctors', 'speciality', oldName, { speciality: next.name }, actor);
        } else if (key === 'sections') {
          await updateWhere('facilities', 'category', oldName, { category: next.name }, actor);
        } else {
          await updateWhere('events', 'category', oldName, { category: next.name }, actor);
        }
      }
      await logActivity(actor, 'Updated', table, id, next.name || oldName);
    }

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
    const key = asManageKey(url.searchParams.get('key'));
    const id = asId(url.searchParams.get('id'));
    const table = MANAGE_TABLE[key];
    const title = await manageTitle(key, id);

    const { error } = await service().from(table).delete().eq('id', id);
    if (error) throw new HttpError(400, error.message);

    await logActivity(actor, 'Deleted', table, id, title);
    revalidateSite();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
