import { NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';
import {
  HttpError,
  actorFromRequest,
  errorResponse,
  logActivity,
  service,
} from '@/lib/admin/server-api';

const PRESETS = new Set(['doctor', 'facility', 'event', 'gallery']);
const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const actor = actorFromRequest(request);
    const body = (await request.json()) as Record<string, unknown>;
    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
    const preset = typeof body.preset === 'string' ? body.preset : '';
    if (!PRESETS.has(preset)) throw new HttpError(400, 'Unknown photo type.');

    const match = /^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/i.exec(dataUrl);
    if (!match) throw new HttpError(400, 'That photo could not be read.');

    const mime = match[1].toLowerCase();
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length) throw new HttpError(400, 'That photo is empty.');
    if (bytes.length > MAX_BYTES) throw new HttpError(413, 'That photo is too large.');

    const extension = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
    const path = `cms/${preset}/${fileName}`;
    const client = createServiceSupabase();

    const upload = await client.storage.from('media').upload(path, new Blob([bytes], { type: mime }), {
      contentType: mime,
      cacheControl: '31536000',
      upsert: false,
    });
    if (upload.error) throw new HttpError(400, `The photo could not be uploaded: ${upload.error.message}`);

    const id = crypto.randomUUID();
    const width = Number.isFinite(Number(body.width)) ? Number(body.width) : null;
    const height = Number.isFinite(Number(body.height)) ? Number(body.height) : null;
    const crop = body.crop && typeof body.crop === 'object' ? body.crop : null;
    const { error } = await client.from('media').insert({
      id,
      file_name: fileName,
      storage_path: path,
      original_path: null,
      width,
      height,
      size_bytes: bytes.length,
      mime_type: mime,
      preset,
      crop,
      uploaded_by: null,
    });
    if (error) {
      await client.storage.from('media').remove([path]);
      throw new HttpError(400, `The photo could not be saved: ${error.message}`);
    }

    await logActivity(actor, 'Uploaded image', 'media', id, fileName);
    const url = client.storage.from('media').getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ id, url, path });
  } catch (error) {
    return errorResponse(error);
  }
}
