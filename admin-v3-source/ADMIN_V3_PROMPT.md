# Rebuild the admin from the NEW design (content-admin.html) as Next.js pages

The NEW approved admin is `admin-v3-source/content-admin.html`.
It REPLACES the old admin design. Do not use these as a design reference: `admin-port-source/`, `public/admin-ui/`, or the current `src/app/admin` look.
Keep the existing Supabase project, tables, auth and storage bucket.

## Read the source first
`content-admin.html` is plain, readable HTML + CSS + vanilla JS. There is no build step.
- `<style>` in `<head>` holds ALL the design: tokens, `.shell`, `.side`, `.nav`, `.pagehead`, `.tabs`, `.btn`, `.fld`, drawer, cropper, toasts, dialogs and the responsive rules. Copy it verbatim into `src/app/admin/admin.css`, imported only by `src/app/admin/layout.tsx`. Keep the class names so the markup ports 1:1.
- The markup is built by JS template strings: `loginHTML()`, `sideHTML()`, `modHTML(m)`, `tabBody()`, `doctorForm()`, `facilityForm()`, `eventForm()`, the drawer, `confirmBox()`, `toast()` and the image editor. Port each one to a React component with IDENTICAL markup, classes and text.
- Icons: `ico(name, size)` returns inline SVG. Port it to `<Icon name size />` with the same paths.
- `seed()` lists the record fields. `localStorage` (KEY `mgrh-cms-proto-v1`) is the prototype store. Replace it with Supabase (see Data).
- Fonts: DM Sans + DM Mono (Google Fonts link in `<head>`). Load them with next/font in the admin layout only.
- Logo: `admin-v3-source/mgrh-logo.png` → `public/images/admin/mgrh-logo.png` (where `MARK` is used).

## Structure in the new design
- Sidebar has 3 items only: **Doctors, Facilities, Events** (`NAV`). There is no Dashboard, Media or Settings page, so don't add them.
- Each page has tabs (`TABS`):
  - Doctors → Doctors | Support staff
  - Facilities → Facilities | Sections
  - Events → Events | Categories
- Add and edit happen in a right-side DRAWER, not on separate pages. Delete uses a confirm box with Undo (10 s). Hide/Show toggles visibility. Drag-to-reorder sets the order.
- Photos use the built-in crop editor (`editImage`). Its output is a JPEG at 0.86 quality, plus alt text.

## Next.js files
```
src/app/admin/layout.tsx              shell: sidebar + main, admin.css, fonts, auth guard
src/app/admin/page.tsx                redirect → /admin/doctors
src/app/admin/login/page.tsx          loginHTML() markup → Supabase email + password sign-in
src/app/admin/doctors/page.tsx        tabs: list | support   (?tab=support)
src/app/admin/facilities/page.tsx     tabs: list | sections  (?tab=sections)
src/app/admin/events/page.tsx         tabs: list | categories (?tab=categories)
src/components/admin/*                Sidebar, PageHead, Tabs, RecordList, Drawer, DoctorForm,
                                      FacilityForm, EventForm, ImageEditor, ConfirmBox, Toasts, Icon
src/lib/admin/store.ts                Supabase reads/writes (replaces localStorage)
```
- Tabs are part of the URL, as `?tab=…`. Sidebar items use next/link, and the active state follows the route.
- The address bar never shows `.html`.

## Login (change from prototype)
The prototype asks for a name and a role with no password. Replace that with **email + password** (Supabase Auth), keeping the same card design, brand row, field styles and button. Remove the line "Prototype sign-in…". After sign-in, show the user's name and role from `profiles`.

## Data: map prototype fields to Supabase
| Prototype | Supabase |
|---|---|
| doctor `name, role, qual, exp, spec, schedule, location, visible, photo` | doctors `name, designation, qualifications, experience, speciality, schedule, location, status ('published' if visible else 'draft'), image` |
| support staff | `support_staff` table: create it if missing, with `id, title, count, description, sort_order` |
| specialities list | categories where `kind = 'doctors'` |
| facility fields + section | facilities, plus `category` = section name; sections = categories where `kind = 'facilities'` |
| event `title, date, cat, loc, desc, status, featured, cover, gallery` | events `title, event_date, category, venue, summary, status, featured, cover_image, gallery (jsonb)` |
| event categories | categories where `kind = 'events'` |
| order (drag) | `sort_order` |
| photos (data URLs) | upload to Storage bucket `media` and save the public URL. Never store data URLs |

Add any missing columns with an SQL migration file, and give me the SQL. Don't drop existing columns.

After every save, hide, delete or reorder, revalidate `/`, `/doctors`, `/facilities` and `/events` so the website updates.

## Clean up (after every screen matches)
- Delete the old admin components and pages that the new design doesn't use (Dashboard, Media, Settings, old list/form pages).
- Delete `public/admin-ui/` and the old `/admin` → `/admin-ui` redirect.
- Keep `X-Robots-Tag: noindex, nofollow` on `/admin/:path*`.

## Test (1440 px and 390 px; the source already includes mobile rules)
1. Open `content-admin.html` directly in the browser next to `localhost:3000/admin/...`. Each screen and each tab must match in layout, text, colours, drawer, confirm box, toasts and the image editor.
2. Sign in and out as mgrh@admin.com.
3. For a doctor, a facility and an event: add, edit, hide, show, reorder, delete and undo. Check each change on the public site in a private window.
4. Upload and crop a photo. It must appear in Storage → `media` and on the site.
5. `tsc --noEmit` and `npm run build` pass, and there are no console errors.

Report: for each screen, either "matches" or the list of differences, plus the SQL migration you added.
