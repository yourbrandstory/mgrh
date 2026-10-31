# Morarji Gokuldas Rural Hospital — Website

Public website and content editor for MGRH, Mahabaleshwar. Built with **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS + Supabase**.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # TypeScript only
```

Supabase must be configured first — see [SETUP.md](SETUP.md) for the schema, seed data, storage bucket, environment variables and the first administrator account.

## Where things are

```
public/site/                 public pages served by Next rewrites
public/admin-ui/             approved self-contained admin UI + Supabase adapter
src/app/api/                 revalidation, invitations, team management, backup/restore
src/app/api/admin-ui/        bearer-auth bridge for the static admin UI
src/components/              public site components
src/data/siteContent.ts      fixed public content: settings, nav, milestones, stats, programmes, support
src/hooks/useSiteContent.ts  accessor for the fixed content
src/lib/content.ts           published-content queries for public pages
src/lib/supabase/            browser and server Supabase clients
src/proxy.ts                 staff-profile protection for /api/admin
src/_disabled_app/admin/     old React editor (disabled)
mgrh_admin_handoff/          design reference, schema and seed SQL
```

## Content

- **Doctors, facilities and events** are stored in Supabase and edited at `/admin`, which serves the approved static UI from `public/admin-ui/`.
- Public pages only show published rows. Staff can preview drafts with `?preview=1`.
- **Fixed content** (phone numbers, OPD hours, milestones, stats, programmes, support cards) lives in `src/data/siteContent.ts`.
- Photos are cropped in the browser to the preset size, stored in the public `media` bucket, and served through Supabase.

## Deploy

Deploy on Vercel. Set the environment variables listed in [SETUP.md](SETUP.md), then use the default Next.js build settings.

`/admin` redirects to `/admin-ui/index.html`; both paths are excluded from the sitemap and `robots.txt`, carry `X-Robots-Tag: noindex, nofollow`, and are not linked from the public website.
