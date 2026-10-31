# Port the admin to React pages under /admin (no index.html)

The admin now works from `public/admin-ui/index.html` and is connected to Supabase (real counts showing). Now rebuild it as proper Next.js React pages at `/admin/*`, so it looks and behaves EXACTLY the same. Port the same way as the public pages.

## Source (use ONLY this folder)
- `admin-port-source/admin.dc.html`: the READABLE source of the approved admin.
  - Template = between `<x-dc>` and `</x-dc>`: every screen's markup with inline styles.
  - Logic = the `class Component` script: state, handlers, and `renderVals()` (all data and labels).
  - `{{ x }}` = value from renderVals; `<sc-for list="{{ a }}" as="i">` = `a.map(i => …)`; `<sc-if value="{{ f }}">` = `{f && …}`.
- `admin-port-source/mgrh-cms-store.js`: the data API the design calls (`load`, `commit`, `published`, `mediaSrc`, `session`…). Its field names are the contract.
- `admin-port-source/assets/`: logo and photos used in the admin.
- The running `public/admin-ui/index.html` is the visual reference. Compare against it, then delete it at the end.

## Routes (App Router, all client components inside one admin layout)
- `/admin/login`
- `/admin` (Dashboard)
- `/admin/doctors`, `/admin/doctors/new`, `/admin/doctors/[id]`
- `/admin/facilities`, `/admin/facilities/new`, `/admin/facilities/[id]`
- `/admin/events`, `/admin/events/new`, `/admin/events/[id]`
- `/admin/media`
- `/admin/settings`

The sidebar (Dashboard, Doctors, Facilities, Events, Media Library, Settings), the header (title + search + "View website ↗") and the user box are in `src/app/admin/layout.tsx`. Sidebar links use `<Link>`; the active item follows the route. Keep the page-switch transition from the source.

## Data
- Reuse the Supabase logic already in `public/admin-ui/supabase-store.js`. Move it to `src/lib/admin/store.ts` (TypeScript, same functions, same field mapping) and expose it through a React context/hook `useAdminStore()`. Do not change the database schema.
- Sign in with Supabase auth (mgrh@admin.com). If not signed in, `/admin/*` goes to `/admin/login`. If signed in, `/admin/login` goes to `/admin`. Protect it in middleware AND client-side.
- After any save, publish or delete, call `revalidatePath` (via /api/revalidate) for `/`, `/doctors`, `/facilities` and `/events`, so the website updates.

## Porting rules (same as the public pages)
- Markup to JSX element by element, keeping every inline style value exactly. `style-hover` / `style-focus` become a CSS module.
- Copy all labels, empty states, helper text, toasts and confirm-dialog text word for word.
- Image cropping/upload (presets, 5 MB limit, JPG/PNG/WebP) works exactly as in the source; uploads go to Supabase Storage `media`.
- Icons are inline JSX `<svg>` with the same paths.
- Do NOT redesign, rename sidebar items, or add or remove features.

## Finish
1. Remove the `/admin` redirect to `/admin-ui/index.html` from next.config.mjs.
2. Delete `public/admin-ui/` once every screen matches.
3. Keep `X-Robots-Tag: noindex, nofollow` on `/admin/:path*`.

## Test (1440px, then 1024px)
- Each screen side by side with the old index.html: same layout, text and colours.
- Sign in and out. Add, edit, publish and draft a doctor, a facility and an event, and check each change on the public site in a private window.
- Upload a photo; it must appear in Storage → media and on the site.
- No console errors; `tsc --noEmit` and `npm run build` pass.

## Report
Per screen: "matches" or the remaining differences, plus any failed test.
