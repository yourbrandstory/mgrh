# Add the MGRH photos (paste into your editor)

The folder `mgrh_photos/` holds every photo from the approved designs, renamed by page and section. `mgrh_photos/PHOTOS_GUIDE.md` lists exactly where each one goes. Read it first.

## 1. Static page photos (everything marked "Static")
1. Copy each page folder into `public/images/`, keeping the names. For example `public/images/01-home/home-hero-doctors.png`, `public/images/02-about/about-hero-aerial.png`.
2. In each page component, point the existing image (or the empty background / placeholder) at the new path as listed in the guide:
   - Hero backgrounds stay `object-fit: cover`, with the same overlay and gradient as now.
   - Use `next/image` with `fill` and `sizes="100vw"` for heroes, and `priority` on the hero image only.
   - Keep each page's current `object-position` and animations (About Us hero slow drift, Home hero, etc.). Don't change any layout, text or colours.
3. Logo: use `public/images/00-shared/logo.png` in the public header and footer, and in the admin sidebar and login.
4. Camps & Events hero: show a small credit, "Photo by LuAnn Hunt on Unsplash", linked to https://unsplash.com/@luann_hunt, in the bottom-right corner of the hero at 12px with 70% white.
5. Add descriptive `alt` text, for example "Aerial view of Morarji Gokuldas Rural Hospital among the trees". Use `alt=""` for decorative hero backgrounds.

## 2. Facility photos (marked "Admin (Supabase)")
These must go into Supabase so the admin can manage them. Write a one-off script, `scripts/upload-facility-photos.ts`, run with `npx tsx` and the service-role key from `.env.local`. For each file:
1. Upload it to the `media` bucket at `facility/<uuid>.jpg`. Convert it to JPEG at 1200×900 (4:3, cover crop), quality 0.86, using `sharp`. Also upload the untouched original to `originals/<uuid>.png`.
2. Insert a `media` row: `file_name`, `storage_path`, `original_path`, `width` 1200, `height` 900, `size_bytes`, `mime_type` 'image/jpeg', `preset` 'facility', `crop` `{"zoom":1,"x":0,"y":0,"rot":0}`.
3. Insert a `facility_images` row linking it to the facility by name, with `sort_order` 0 and `cover_index` 0:

| File | Facility name | Caption |
|---|---|---|
| facility-icu-patient-under-care.png | Intensive Care Unit (ICU) | Patient under care |
| facility-operation-theatre.png | Operation Theatre | Operation theatre |
| facility-pathology-lab.png | Pathology Lab | Pathology laboratory |
| facility-additional-facilities-corridor.png | Additional Facilities | Hospital corridor |

4. The script must be safe to re-run: skip a facility that already has an image with the same `file_name`.
5. Then call `POST /api/revalidate` (or redeploy) so the Facilities page and the Home facilities teaser show the photos.

## 3. Check
- Open every public page at 1440px wide. Each hero and section photo should appear exactly where the guide says.
- The Facilities page should show the four facility photos.
- The admin Media Library should list the four facility photos as "Used by facilities".
- `npm run build` passes.

Report the files changed and the output of the upload script.
