# Paste this into OpenCode

Read `mgrh_admin_handoff/README.md` in full before writing any code. Then:

1. **Admin panel at `/admin`.** Rebuild the admin in this Next.js (App Router, TypeScript) project using the HTML prototype `mgrh_admin_handoff/design/MGRH Admin.dc.html` as the visual and behaviour reference.
   - Match it exactly: layout, colours, DM Sans, copy, states, page transitions.
   - Use the routes in README §1.
   - `/admin` must not be linked anywhere on the public site, must not be in the sitemap, and must send `noindex` (robots.txt `Disallow: /admin`, an `X-Robots-Tag` header, and a meta tag).
   - Staff reach it only by typing `https://mgrh.vercel.app/admin`.

2. **Supabase.**
   - Install `@supabase/supabase-js` and `@supabase/ssr`.
   - Run `mgrh_admin_handoff/supabase/schema.sql`.
   - Create a public Storage bucket called `media`.
   - Protect every `/admin/*` route except `/admin/login` with middleware that checks the Supabase session and a `profiles` row.
   - Disable public sign-ups. Staff are invited by an administrator from Settings, via a server action using the service-role key (never expose it to the client).
   - Remove the prototype's demo accounts.

3. **Replace the prototype's localStorage store** (`mgrh-cms-store.js`) with Supabase queries.
   - Keep every rule in `mgrh-cms-actions.js` and `mgrh-cms-view.js`: validation messages, publish permissions, confirmations, toasts, reorder, activity log, and the image crop pipeline. Image presets: 800×800 doctor, 1200×900 facility/event, JPEG quality 0.86, max 5 MB, JPG/PNG/WebP.
   - Upload the cropped image and the original to Storage, and keep the crop settings so "Adjust crop" works later.

4. **Seed the database** from `doctorSeed`, `facilitySeed` and `eventSeed` in `mgrh-cms-store.js`.
   - Seed the Emergency / Casualty Ward facility with `needs_review = true`.
   - Seed the events as `draft`, because they are placeholders.

5. **Make the public site dynamic** (README §3).
   - The Doctors, Facilities and Camps & Events pages, and the Home facilities teaser and upcoming events, read only published rows from Supabase with the anon key, in server components.
   - Keep the current public page designs exactly as they are; only swap the hard-coded data for queries.
   - After any change in admin, call `POST /api/revalidate` (secured with `REVALIDATE_SECRET`) so the public pages update within seconds.
   - Add `?preview=1` draft preview for signed-in staff, with a "Draft — not visible on the public website" banner.

6. **Vercel environment variables:**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `REVALIDATE_SECRET`

7. **Do not ship** the prototype's "Reset to original website content" button or its storage meter. Keep backup download and restore as admin-only server routes.

When done, list:
- what you built
- the SQL you ran
- how to create the first administrator
- anything in the README you couldn't follow
