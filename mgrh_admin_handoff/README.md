# Handoff: MGRH Website Editor (admin) + Supabase

Admin panel for the Morarji Gokuldas Rural Hospital website, plus the wiring that makes the public site read its content from Supabase.

- Public site: `https://mgrh.vercel.app`
- Admin: `https://mgrh.vercel.app/admin` — a path on the same site, not a separate domain. (`mgrh/admin.vercel.app` isn't a valid address.)
- `/admin` is never linked from the public site. Staff reach it by typing the URL. It must be excluded from search engines (see Routing).

## About the design files

`design/MGRH Admin.dc.html` is a **high-fidelity HTML prototype**. It shows the intended look and behaviour, but it is not production code. Rebuild it in the project's framework. **Next.js (App Router) + TypeScript on Vercel** is recommended if the site isn't already on something else.

The prototype saves to `localStorage` through `design/mgrh-cms-store.js`. Replace that layer with Supabase. The other two scripts (`mgrh-cms-actions.js`, `mgrh-cms-view.js`) hold all the behaviour rules, so read them alongside this file. Open the HTML in a browser to click through it. Prototype sign-ins: `admin@mgrh-mahabaleshwar.org` / `mgrh-admin`, `editor@mgrh-mahabaleshwar.org` / `mgrh-editor`. **These must not ship.**

Fidelity: **hi-fi**. Match colours, type, spacing and copy exactly.

---

## 1. Routing & hosting (Vercel)

```
/                     public site (existing pages)
/doctors /facilities /events …   public pages, now data-driven
/admin/login          sign-in (public route, noindex)
/admin                dashboard        ┐
/admin/doctors        list             │ protected by middleware:
/admin/doctors/new    form             │ no session → redirect /admin/login
/admin/doctors/[id]   form             │ session but no `profiles` row → sign out + error
/admin/facilities …   same pattern     │
/admin/events …       same pattern     │
/admin/media          Media Library    │
/admin/settings       Settings         ┘
```

- `middleware.ts` matches `/admin/:path*` except `/admin/login`. It uses `@supabase/ssr` to read the session from cookies.
- Hide from search engines:
  - Add `robots.txt` → `Disallow: /admin`.
  - In `next.config` `headers()`, set `X-Robots-Tag: noindex, nofollow` on `/admin/:path*`.
  - Add `<meta name="robots" content="noindex">` in the admin layout.
- No nav link, footer link or sitemap entry points to `/admin`.
- Environment variables (Vercel → Project → Settings → Environment Variables):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`: **server only**, used for inviting staff
  - `REVALIDATE_SECRET`

## 2. Supabase

Run `supabase/schema.sql`. It creates:

- **Tables:**
  - `profiles` (staff and role)
  - `settings` (`editors_can_publish`)
  - `categories`
  - `media`
  - `doctors`
  - `facilities` and `facility_images`
  - `events` and `event_images`
  - `activity_log`
- **RLS:**
  - The public (anon key) can read only `status = 'published'` rows and their images.
  - Staff can create and edit.
  - Only administrators can delete, manage categories, change settings and manage the team.
- **A trigger** (`guard_publish`) that blocks editors from publishing or unpublishing unless `settings.editors_can_publish` is true. Enforce this in the database, not just the UI.
- **Storage policies** for a **public bucket named `media`**. Create the bucket in the dashboard first.

**Auth:**
- Email + password with Supabase Auth.
- Turn off public sign-ups (Authentication → Providers → Email → disable "Allow new users to sign up").
- Staff are added only by an administrator from Settings, through a server action using `supabase.auth.admin.inviteUserByEmail()` (service-role key). The action then inserts the `profiles` row. This replaces the prototype's temporary-password flow.
- Create the first administrator by hand (see the last lines of `schema.sql`).

**Seed content:**
- Port the arrays `doctorSeed`, `facilitySeed` and `eventSeed` from `design/mgrh-cms-store.js` into a seed script, all with `status = 'published'`.
- The Emergency / Casualty Ward facility has no description in the source content. Seed it with `needs_review = true`.
- The events in the seed are placeholders from the current site, not confirmed events. Seed them as `draft`, or confirm them with the hospital first.

**Images:**
- The client crops on a `<canvas>`, the same as the prototype (`drawTo` / `clampEd` in `mgrh-cms-actions.js`).
- The cropped JPEG (quality 0.86) uploads to `media/{preset}/{uuid}.jpg`. The untouched original uploads to `media/originals/{uuid}.{ext}`.
- Then insert a `media` row with `width`, `height`, `size_bytes`, `preset` and `crop`.
- "Adjust crop" re-opens from `original_path` using the saved `crop`.
- Public URLs come from `supabase.storage.from('media').getPublicUrl(path)`.

| Preset | Output | Ratio | Shown as |
|---|---|---|---|
| doctor | 800 × 800 | 1:1 | circle |
| facility | 1200 × 900 | 4:3 | rectangle |
| event | 1200 × 900 | 4:3 | rectangle |

- Accept JPG, PNG and WebP up to 5 MB.
- Warn when the source is smaller than the output size: "This photo is smaller than 1200 × 900 px, so it may look soft on large screens."

## 3. Making the public site dynamic

| Public page | Reads | Notes |
|---|---|---|
| Doctors | `doctors` where published, `order by sort_order` | Speciality filter chips come from `categories(kind='doctors')`. Show `contact` only if `show_contact`. Doctor photos are currently hidden on the public page by client request. Keep them hidden until told otherwise, but fetch `image_id`. |
| Facilities | `facilities` + `facility_images` where published | Group by `category` in `categories(kind='facilities')` order. Render `subitems` (e.g. Radiology → X-Ray, 2D Echo, Sonography). The ICU and Emergency / Casualty Ward use the 3-photo carousel; the other Emergency-section items use one wide image. |
| Camps & Events | `events` + `event_images` where published | "Upcoming" = `event_date >= today`. If an event has no gallery, render `placeholder_slots` empty frames. |
| Home | Facilities teaser (first 3 by `sort_order`), upcoming events (next 3) | The rest of Home is static. |
| Programmes, About, Support, Contact, Emergency | — | Static for now (not in the CMS). |

- Fetch in server components with the anon key.
- After any save, publish, unpublish, delete or reorder in admin, call a route handler `POST /api/revalidate` (checks `REVALIDATE_SECRET`). It runs `revalidatePath('/')`, `('/doctors')`, `('/facilities')` and `('/events')`, so changes are live within seconds.
- Draft preview: `/doctors?preview=1` etc. These show drafts only when a staff session cookie is present, and display a yellow "Draft — not visible on the public website" banner.

---

## 4. Screens

Layout:
- A 288px dark sidebar on the left and the content area on the right.
- The content area has a sticky white header (breadcrumb, page title, global search, "View website ↗"), then `main` with padding 28px 32px 80px and max-width 1480px.

**Sidebar** (`#0B3C49`):
- **Top:** the logo on a white tile (radius 10px, padding 6px 9px), then "Website" over "editor" (#9FD8CE).
- **Six items:** each has a 34px icon chip, a 16px/600 label, and a 13px hint in #A9D5CD.

| Item | Hint |
|---|---|
| Dashboard | Start here |
| Doctors | Names, timings, photos |
| Facilities | Departments and services |
| Events | Camps and drives |
| Media Library | All uploaded photos |
| Settings | Account, team, backups |

- **Active item:** background rgba(255,255,255,0.12), chip #0A8E7B, chip scale 1.08.
- **Bottom:** a user card (initials avatar #0A8E7B, name, role) and a "Log out" outline button.

**Login** (`/admin/login`):
- **Layout:** two equal columns.
- **Left column:**
  - The Mahabaleshwar photo at 22% opacity, with the gradient `linear-gradient(160deg, rgba(8,70,62,0.4), rgba(6,58,52,0.92))` over it.
  - The logo.
  - An eyebrow reading "Content Manager".
  - The headline "Keep the hospital website up to date." (40px/600).
  - The supporting copy.
- **Right column:**
  - The form: Email, Password, and "Sign in" (52px tall, #0A8E7B).
  - An error box (#FDF1F0 background, #9E2018 text): "That email and password don't match an account. Check them and try again."
  - Remove the prototype-accounts box.

**Dashboard:**
- **Greeting** (32px), with the date above and "What would you like to update on the website today?" below.
- **Three task cards:** Doctors, Facilities, Events.
  - Each has a 52px tinted icon tile, a count line (e.g. "10 doctors · 10 live"), a one-line description, and two buttons: "+ Add …" (filled) and "See all" (outline).
  - Icon tile colours: Doctors #E1F3EF, Facilities #E4F4F6, Events #FDF1F0.
- **"How changes reach the website"** band (#EAF6F3, border #CDE8E1), with three numbered steps:
  1. Add or edit
  2. Save as hidden
  3. Show on website
- **"Recently changed"** list (6 items, with a status pill).
- **"Please check"** box (#FFFBF2 / #F3E2B8): lists facilities with `needs_review`, each with "Fix →".
- **"At a glance"** stats, 2×2.

**Lists** (Doctors / Facilities / Events):
- **Header:**
  - Title and count.
  - Description: "Doctors shown on the public Doctors page." / "Departments and services shown on the Facilities page, grouped by section." / "Camps, drives and awareness events shown on the Camps & Events page."
  - "+ Add …" button.
- **Filter bar:**
  - Search.
  - Category filter.
  - Status filter.
  - Date filter (events only): All / Upcoming / Past / each year.
  - Sort: Display order / Name A–Z / Last updated, plus Date newest/oldest for events.
  - "Clear filters".
- **Legend:**
  - ● Live on website — people can see it
  - ● Hidden — saved, but not on the website yet
- **Card grid** (`minmax(320px,1fr)`):
  - A 150px image area (or initials with "No photo yet") and a status pill top-left.
  - Title and subtitle, a 2-line summary, and "Last changed …".
  - Buttons:
    - Main: **Edit** (filled) and **Show on website / Hide from website** (outline).
    - Text links: Preview · Move up · Move down · Delete (red).
- **Empty states:**
  - No records: "No doctors yet" with an add button.
  - No matches: "Nothing matches your search" with "Clear filters".

**Form** (add/edit):
- **Header:**
  - "← All doctors" link.
  - Title, with a status pill and an "Unsaved changes" dot when the form has been changed.
  - Info strip: "Fill in the details below. Fields marked * are required. Save as hidden keeps it off the website while you work; Show on website makes it live."
- **Layout:** a flex-wrap row. Fields go on the left (`flex 1 1 520px`). A sticky side column on the right (`flex 1 1 320px`, max 420px) holds "Save & show on website" and the photo card.
- **Doctor fields:**
  - Basic information:
    - Full name* (wide)
    - Designation
    - Speciality* (select)
    - Qualifications
    - Years of experience
    - Short introduction (textarea)
  - Consultation:
    - Schedule text (wide)
    - Day chips, Mon–Sun
    - Start time
    - End time (must be after start)
    - Location
  - Contact & display:
    - Contact
    - Display order
    - Checkbox: "Contact details are approved to show on the website"
  - Photo card:
    - 200px circle preview
    - Upload image / From library / Adjust crop / Remove
    - Alt text
    - Guide line: "Recommended 800 × 800 px · 1:1 · JPG, PNG or WebP · up to 5 MB"
- **Facility fields:**
  - Name*
  - Section* (select)
  - Sub-category
  - Short description ("Shown next to the photos on the Facilities page.")
  - Full description
  - Display order
  - Sub-facilities repeater (name + description, "+ Add sub-facility")
  - Photos gallery
- **Event fields:**
  - Title*
  - Category*
  - Venue
  - Event date
  - End date (must be on or after the event date)
  - Start time
  - End time
  - Organiser
  - Short summary ("Shown on the event card.")
  - Full description
  - Outcome or highlights
  - Display order
  - Cover image
  - Gallery
- **Gallery rows:**
  - 160px 4:3 thumbnail (with a "Main photo" badge), caption, and alt text.
  - Buttons: Set as main photo / Use as cover, Adjust crop, Replace, ▲, ▼, ✕.
  - Multi-file upload is supported.
- **Side column buttons:**
  - **Hidden record:** "Show on website" (filled) and "Save as hidden" (outline).
  - **Live record:** "Save changes" and "Hide from website".
  - Both states also have Preview and "Delete this record" (admins only).
- **Permission note** (editors without publish rights): "Your role can save drafts. An administrator needs to publish." The publish buttons are dimmed to 0.45 opacity.

**Image editor (modal):**
- **Canvas:**
  - Drag to reposition. Doctor photos use a circular mask; facility and event photos use a rule-of-thirds grid.
  - Zoom slider from 100% to 400%, with − and + buttons.
  - Rotate left / Rotate right / Reset.
  - Panning is clamped so the crop is always filled.
- **Info panel:** file name, original dimensions, size and type, output size, shape.
- **States:**
  - Loading: spinner, "Uploading image…".
  - Error: "Upload failed" with "Choose another file".
  - When several files are selected, they queue: "2 more images waiting after this one".

**Media Library:**
- **Toolbar:** search by file name, usage filter (All / doctors / facilities / events / Not used anywhere), Grid/List toggle.
- **Each item:** thumbnail, name, dimensions, size, type, uploaded date and "used by" line.
- **Actions:** Replace and Delete. Delete is blocked while the image is in use: "This image is still in use. It appears on …".
- **Replace:** if the image is live on published pages, warn first: "Replace an image that's live? … updates all of them as soon as you save."
- Drop the prototype's storage meter; it only applied to `localStorage`.

**Settings:**
- **Your account:** name, email (read-only), and new password with confirmation (minimum 8 characters). Use `supabase.auth.updateUser`.
- **Team & permissions** (admin-only controls):
  - "Editors can publish and unpublish" toggle (`settings.editors_can_publish`).
  - User list with Remove.
  - Add account: name, email, role → invite email.
- **Categories:** three columns: Doctor specialities, Facility sections, Event categories.
  - Add, ▲ reorder, ✕ remove.
  - Remove is blocked while a category is in use: "… is used by 3 records. Move them to another category first."
- **Backup & restore:**
  - "Download backup": a server route exports all tables as JSON, admin only.
  - Restore: admin only, behind a confirmation.
  - **Leave out the prototype's "Reset to original website content"** in production.

---

## 5. Behaviour rules

- **Statuses:**
  - In the database: `draft` / `published`.
  - In the UI, always: **Hidden** (#FDF3E1 bg / #8A5A06 text / #E3A21A dot) and **Live on website** (#E1F3EF / #0A5F52 / #0A8E7B).
- **Validation** (inline, red #B4251E text under the field, red border):
  - "Enter the doctor's full name."
  - "Choose a speciality."
  - "End time must be after the start time."
  - "Enter the facility name."
  - "Choose the section this facility appears under."
  - "Enter the event title."
  - "End date must be on or after the event date."
  - Toast after any of these: "Some required details are missing. Check the fields marked in red."
- **Unsaved changes:**
  - Leaving the form opens a confirmation: "Discard unsaved changes?"
  - Add a `beforeunload` guard as well.
- **Confirmations:** every delete (records, images, users) and every restore. The confirm button is red (#C42A21) for destructive actions.
- **Toasts:** bottom-centre. #0B4F45 for success, #9E2018 for errors. They auto-dismiss after 3.4s (6s for errors). Messages:
  - "Draft saved. It is not visible on the website yet."
  - "Published. It is now visible on the website."
  - "Unpublished. It has been removed from the website."
  - "Changes saved and live on the website."
- **Reorder:** Move up / Move down swap `sort_order` with the neighbouring record.
- **Activity log:** write a row for every add, update, publish, unpublish, delete, reorder, image upload, image replace and settings change.
- **Global search** (header): matches titles across doctors, facilities and events after 2 characters. Shows up to 8 results, plus "No matches.".
- **Page transition:** on every view change, `main` animates for 0.42s with `cubic-bezier(0.2,0.8,0.3,1)`:
  - From: opacity 0, `translateY(18px)`, `blur(3px)`.
  - To: opacity 1, no offset, no blur.
  - The page title animates 0.36s ease from `translateX(-10px)`.
  - Disable both under `prefers-reduced-motion`.
- **Roles:**
  - Administrator: everything.
  - Editor: add and edit, publish only if allowed, no deletes, no categories or team management.
  - Hide or disable controls in the UI, and rely on RLS and the trigger as the real guard.

## 6. Design tokens

- **Font:** DM Sans, weights 400, 500, 600 and 700 (Google Fonts).

| Role | Value |
|---|---|
| Sidebar | #0B3C49 |
| Primary / hover | #0A8E7B / #0B7F73 |
| Page background | #F4F7F6 |
| Card | #FFFFFF, border #E2ECE9 |
| Input border | #D5E2DE |
| Outline button border | #9FD0C7 |
| Headings / body | #0B3C49 / #16413A |
| Secondary text | #45605A, #5A6A66, #7A8C87 |
| Info band | #EAF6F3 / #CDE8E1 |
| Review | #FFFBF2 / #F3E2B8 / #7A5205 |
| Danger | #C42A21, #B4251E, border #F0D2CF |

- **Radii:** 8px for inputs and small buttons, 10px for main buttons, 12–16px for cards, 999px for pills.
- **Type scale:** page title 25/600; section titles 28–32/600; card titles 17–21/600; body 15–16; meta 13–14.
- **Controls:** inputs 46px tall (44px in compact rows); main buttons 44–48px.
- **Shadows:** card hover `0 24px 46px -32px rgba(10,60,52,0.45)`; modal `0 40px 90px -30px rgba(0,0,0,0.5)`.

## 7. Files

- `design/MGRH Admin.dc.html` — the admin prototype (all screens and modals).
- `design/mgrh-cms-store.js` — data shape and **seed content** (replace with Supabase).
- `design/mgrh-cms-actions.js` — save, publish, delete, reorder, image pipeline, validation.
- `design/mgrh-cms-view.js` — list, filter and sort logic; form field definitions; copy.
- `design/support.js` — runtime the prototype needs in order to open in a browser. Not for production.
- `design/assets/` — logo and login background.
- `supabase/schema.sql` — tables, RLS, triggers, storage policies, category seed.
- `OPENCODE_PROMPT.md` — instructions to paste into OpenCode.
