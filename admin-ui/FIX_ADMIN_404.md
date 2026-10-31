# /admin is 404: restore the approved admin from THIS folder only

The ONLY source for the admin is this folder (`admin-ui/`). Ignore any other admin code, old React admin pages, or earlier versions.

## 0. Put the folder in place
- Copy this whole `admin-ui/` folder to `public/admin-ui/` (replacing what's there). It must contain:
  `public/admin-ui/index.html` and `public/admin-ui/assets/` (logo + photos).
- If `public/admin-ui/supabase-store.js` already exists from before, KEEP it.
- If `src/app/admin/**` still exists, move it to `src/_disabled_app/admin`. Keep `/api`.

## 1. Find why /admin is 404 (report the one-line cause first)
Check in this order:
a. `next.config.mjs`: the redirect `/admin` and `/admin/:path*` → `/admin-ui/index.html` is missing or was overwritten during the page port.
b. `src/middleware.ts` / `src/proxy.ts`: the matcher or DC_REDIRECTS catches `/admin` or `/admin-ui`.
c. A catch-all route or `not-found.tsx` in `src/app/(site)` swallows `/admin`.
d. `public/admin-ui/index.html` is missing.

## 2. Fix
- `next.config.mjs` must contain, alongside the existing page rewrites:
  - a REDIRECT (not a rewrite): `/admin` and `/admin/:path*` → `/admin-ui/index.html`
  - a header `X-Robots-Tag: noindex, nofollow` for `/admin-ui/:path*`
- The middleware must not touch `/admin-ui/*`.
- Do NOT edit or reformat `index.html`, except for the two lines in step 3.

## 3. Supabase on (only if not already there)
At the very top of `<head>` in `public/admin-ui/index.html`, there must be exactly:
```html
<script>window.__MGRH_EXTERNAL_STORE = true;</script>
<script src="/admin-ui/supabase-store.js"></script>
```
If `supabase-store.js` doesn't exist, build it exactly as `ADMIN_PROMPT.md` (in this folder) describes.

## 4. Check the connection
- Restart `npm run dev`, open /admin, and sign in as mgrh@admin.com / admin123.
- The dashboard counts must come from Supabase (about 10 doctors, 14 facilities, 9 events).

## 5. Check that admin changes reach the website
For each of doctors, facilities and events:
1. In /admin, add a test item, set it to **Published**, and save.
2. Open /doctors, /facilities, /events (and / for the home teasers) in a private window. The item must appear.
3. Edit its name and refresh the page. The change must show.
4. Set it to **Draft**. It must disappear.
5. Delete the test item.

If a public page doesn't update: it must read Supabase rows where `status = 'published'`, not only the fallback list, and must not be statically cached. Use `export const dynamic = 'force-dynamic'` or revalidate after save.

Photo check: upload a doctor photo in /admin. It must show on /doctors and in Storage → media.

## Report
- the 404 cause and the fix
- a pass/fail table: one row each for doctors, facilities, events and home; columns for publish, edit and draft-hide
- any errors
