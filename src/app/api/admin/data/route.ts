import { NextResponse } from 'next/server';
import { actorFromRequest, errorResponse, service } from '@/lib/admin/server-api';

export async function GET(request: Request) {
  try {
    actorFromRequest(request);
    const db = service();

    const [doctors, facilities, facilityImages, events, eventImages, categories] =
      await Promise.all([
        db.from('doctors').select('*').order('sort_order', { ascending: true }),
        db.from('facilities').select('*').order('sort_order', { ascending: true }),
        db.from('facility_images').select('*').order('sort_order', { ascending: true }),
        db.from('events').select('*').order('sort_order', { ascending: true }),
        db.from('event_images').select('*').order('sort_order', { ascending: true }),
        db.from('categories').select('*').order('sort_order', { ascending: true }),
      ]);

    for (const result of [doctors, facilities, events, categories]) {
      if (result.error) throw new Error(result.error.message);
    }

    const support = await db
      .from('support_staff')
      .select('*')
      .order('sort_order', { ascending: true });

    const mediaIds = new Set<string>();
    (doctors.data || []).forEach((row) => row.image_id && mediaIds.add(row.image_id));
    (facilityImages.data || []).forEach((row) => row.media_id && mediaIds.add(row.media_id));
    (events.data || []).forEach((row) => row.cover_id && mediaIds.add(row.cover_id));
    (eventImages.data || []).forEach((row) => row.media_id && mediaIds.add(row.media_id));

    let media: unknown[] = [];
    if (mediaIds.size) {
      const result = await db.from('media').select('*').in('id', Array.from(mediaIds));
      media = result.error ? [] : result.data || [];
    }

    return NextResponse.json({
      doctors: doctors.data || [],
      facilities: facilities.data || [],
      facility_images: facilityImages.error ? [] : facilityImages.data || [],
      events: events.data || [],
      event_images: eventImages.error ? [] : eventImages.data || [],
      categories: categories.data || [],
      support: support.error ? [] : support.data || [],
      media,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
