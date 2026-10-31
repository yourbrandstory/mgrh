/**
 * One-off upload of the four approved facility photos into Supabase.
 *
 *   npx tsx scripts/upload-facility-photos.ts
 *
 * For each photo it:
 *   1. crops it to 1200x900 (4:3 cover) JPEG quality 86 (0.86) with `sharp` and
 *      uploads it to media/facility/<uuid>.jpg, plus the untouched original
 *      to media/originals/<uuid>.png,
 *   2. inserts a `media` row (preset 'facility', default crop),
 *   3. inserts a `facility_images` row for the facility (sort_order 0,
 *      facilities.cover_index left at 0) with the caption from the guide.
 *
 * Safe to re-run: a facility that already has an image with the same
 * `file_name` is skipped. Finishes by calling POST /api/revalidate.
 */
import { randomUUID } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// ---- environment -----------------------------------------------------------
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, '');
      if (!(m[1] in process.env)) process.env[m[1]] = value;
    }
  }
}
loadEnv();

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || '';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!URL_ || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(URL_, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const SOURCE_DIR = path.join(process.cwd(), 'mgrh_photos', '03-facilities');

const PHOTOS: { file: string; facility: string; caption: string }[] = [
  { file: 'facility-icu-patient-under-care.png', facility: 'Intensive Care Unit (ICU)', caption: 'Patient under care' },
  { file: 'facility-operation-theatre.png', facility: 'Operation Theatre', caption: 'Operation theatre' },
  { file: 'facility-pathology-lab.png', facility: 'Pathology Lab', caption: 'Pathology laboratory' },
  { file: 'facility-additional-facilities-corridor.png', facility: 'Additional Facilities', caption: 'Hospital corridor' },
];

const CROP = { zoom: 1, x: 0, y: 0, rot: 0 };

async function uploadOne(photo: (typeof PHOTOS)[number]) {
  const sourcePath = path.join(SOURCE_DIR, photo.file);

  // 1. facility lookup
  const { data: facility, error: facErr } = await supabase
    .from('facilities')
    .select('id, name, cover_index')
    .eq('name', photo.facility)
    .maybeSingle();
  if (facErr) throw new Error(`facilities lookup: ${facErr.message}`);
  if (!facility) {
    console.log(`SKIP   ${photo.file} — facility "${photo.facility}" not found`);
    return 'skipped: no facility';
  }

  // 2. already linked?
  const { data: links, error: linkErr } = await supabase
    .from('facility_images')
    .select('id, media:media_id ( file_name )')
    .eq('facility_id', facility.id);
  if (linkErr) throw new Error(`facility_images lookup: ${linkErr.message}`);
  const existing = (links || []).find((l) => (l.media as { file_name?: string } | null)?.file_name === photo.file);
  if (existing) {
    console.log(`SKIP   ${photo.file} — "${photo.facility}" already has this image`);
    return 'skipped: already uploaded';
  }

  // 3. crop + upload
  const original = readFileSync(sourcePath);
  const jpeg = await sharp(original)
    .resize(1200, 900, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 86, mozjpeg: false })
    .toBuffer();

  const uuid = randomUUID();
  const storagePath = `facility/${uuid}.jpg`;
  const originalPath = `originals/${uuid}.png`;

  const up1 = await supabase.storage.from('media').upload(storagePath, jpeg, {
    contentType: 'image/jpeg',
    upsert: false,
  });
  if (up1.error) throw new Error(`upload ${storagePath}: ${up1.error.message}`);

  const up2 = await supabase.storage.from('media').upload(originalPath, original, {
    contentType: 'image/png',
    upsert: false,
  });
  if (up2.error) throw new Error(`upload ${originalPath}: ${up2.error.message}`);

  // 4. media row
  const { data: media, error: mediaErr } = await supabase
    .from('media')
    .insert({
      file_name: photo.file,
      storage_path: storagePath,
      original_path: originalPath,
      width: 1200,
      height: 900,
      size_bytes: jpeg.length,
      mime_type: 'image/jpeg',
      preset: 'facility',
      crop: CROP,
    })
    .select('id')
    .single();
  if (mediaErr) throw new Error(`media insert: ${mediaErr.message}`);

  // 5. link it to the facility
  const { error: insErr } = await supabase.from('facility_images').insert({
    facility_id: facility.id,
    media_id: media.id,
    caption: photo.caption,
    alt: `${photo.facility} — ${photo.caption}`,
    sort_order: 0,
  });
  if (insErr) throw new Error(`facility_images insert: ${insErr.message}`);

  await supabase.from('facilities').update({ cover_index: 0 }).eq('id', facility.id);

  console.log(
    `OK     ${photo.file}\n       facility "${photo.facility}" · media ${media.id}\n` +
      `       ${storagePath} (${(jpeg.length / 1024).toFixed(0)} KB, 1200x900 q0.86) + ${originalPath}`,
  );
  return 'uploaded';
}

async function main() {
  console.log(`Uploading ${PHOTOS.length} facility photos to bucket "media"…\n`);
  const results: Record<string, number> = {};
  for (const photo of PHOTOS) {
    try {
      const outcome = await uploadOne(photo);
      results[outcome] = (results[outcome] || 0) + 1;
    } catch (err) {
      results['failed'] = (results['failed'] || 0) + 1;
      console.error(`FAIL   ${photo.file} — ${(err as Error).message}`);
    }
  }

  console.log('\nSummary:', Object.entries(results).map(([k, v]) => `${v} ${k}`).join(', '));

  // 6. refresh the public pages
  try {
    const res = await fetch(`${SITE}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': REVALIDATE_SECRET, 'content-type': 'application/json' },
    });
    console.log(`revalidate ${SITE}/api/revalidate → ${res.status} ${await res.text()}`);
  } catch (err) {
    console.log(`revalidate failed: ${(err as Error).message} — redeploy or call POST /api/revalidate`);
  }
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
