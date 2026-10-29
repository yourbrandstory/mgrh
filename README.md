# Morarji Gokuldas Rural Hospital — Website

Public website and content editor for MGRH, Mahabaleshwar. Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase**.

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
src/app/(site)/              public pages (home, doctors, facilities, events, about, …)
src/app/admin/               protected editor (login + dashboard, doctors, facilities, events, team, settings, activity)
src/app/api/                 revalidation, invitations, team management, backup/restore
src/components/              public site components
src/components/admin/        editor shell, data provider, image cropper, shared UI
src/data/siteContent.ts      fixed public content: settings, nav, milestones, stats, programmes, support
src/hooks/useSiteContent.ts  accessor for the fixed content
src/lib/content.ts           published-content queries for public pages
src/lib/supabase/            browser and server Supabase clients
middleware.ts                session + staff-profile protection for /admin and /api/admin
mgrh_admin_handoff/          design reference, schema and seed SQL
```

## Content

- **Doctors, facilities and events** are stored in Supabase and edited at `/admin`.
- Public pages only show published rows. Staff can preview drafts with `?preview=1`.
- **Fixed content** (phone numbers, OPD hours, milestones, stats, programmes, support cards) lives in `src/data/siteContent.ts`.
- Photos are cropped in the browser to the preset size, stored in the public `media` bucket, and served through Supabase.

## Deploy

Deploy on Vercel. Set the environment variables listed in [SETUP.md](SETUP.md), then use the default Next.js build settings.

`/admin` is excluded from the sitemap and `robots.txt`, carries `X-Robots-Tag: noindex, nofollow`, and is not linked from the public website.
