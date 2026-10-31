# MGRH website setup

The public website and the content editor at `/admin` run on Next.js 16 (App Router) with Supabase for accounts, content and photos.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `mgrh_admin_handoff/supabase/schema.sql`.
3. Run `mgrh_admin_handoff/supabase/seed.sql` to load the initial doctors, facilities and draft events.
4. Open **Storage** and create a **public** bucket named `media`.
   The schema adds the storage policies, but the bucket itself must be created in the dashboard.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local development, and add the same values in Vercel → Project → Settings → Environment Variables.

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (server only — never expose it) |
| `REVALIDATE_SECRET` | Any long random string |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, used for metadata and the sitemap |

## 3. Create the first administrator

1. Supabase → **Authentication → Users → Add user**. Create the account with an email and password (or send an invite).
2. Copy the new user’s UUID.
3. In the SQL editor:

```sql
insert into public.profiles (id, full_name, role)
values ('<auth user id>', 'Hospital Administrator', 'administrator');
```

There is no public sign-up. Additional staff are invited from **Admin → Team** by an administrator; Supabase sends the invitation email. Configure **Authentication → Email** / SMTP in Supabase for reliable delivery.

## 4. Run locally

```bash
npm install
npm run dev
```

- Public website: `http://localhost:3000`
- Editor: `http://localhost:3000/admin` (serves the approved static UI and signs in through Supabase)

Useful checks:

```bash
npm run typecheck
npm run build
```

## 5. How the editor works

- **Doctors, facilities and events** are saved as drafts or published. Public pages only read published rows.
- **Draft preview:** while signed in, append `?preview=1` to a public page (for example `/doctors?preview=1`) to see drafts with a “Draft — not visible on the public website” banner. The editor’s **View website** button opens the preview.
- **Publishing:** administrators can always publish. Editors can publish only when **Settings → Editors can publish content** is switched on. The database enforces the same rule.
- **Photos:** uploaded photos are cropped in the browser to 800 × 800 (doctors) or 1200 × 900 (facilities and events), saved as JPEG quality 0.86, and limited to 5 MB. The untouched original is also stored so a photo can be re-cropped later.
- **Revalidation:** the legacy React editor used `POST /api/revalidate`. The static admin UI writes directly to Supabase; public pages are served from `public/site/`.
- **Backup:** administrators can download a JSON backup from **Settings** and restore it there. Restoring overwrites matching records.
- **Activity log:** every add, edit, publish, delete, reorder, upload and invitation is recorded under **Activity**.

## 6. Privacy

`/admin` redirects to `/admin-ui/index.html`; both paths are excluded from the sitemap and `robots.txt`, and carry `X-Robots-Tag: noindex, nofollow`. `/api/admin` remains session-protected. Do not link to `/admin` from the public website.
