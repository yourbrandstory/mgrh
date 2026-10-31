# Make /admin the exact approved admin, backed by Supabase

GOAL: /admin must look and behave EXACTLY like `public/admin-ui/index.html`. Do not rebuild the UI in React, and do not restyle anything.

`public/admin-ui/index.html` is ONE self-contained file: the whole UI, its scripts, fonts and logo are inside it. It already works by double-clicking it (it saves to the browser). `public/admin-ui/assets/` holds 4 starting facility photos.

## 1. Serve it
- In next.config.mjs, add a redirect (NOT a rewrite): `/admin` and `/admin/:path*` → `/admin-ui/index.html`. A redirect keeps the relative `assets/...` photo paths working.
- Move the old React admin (src/app/admin/**) to src/_disabled_app/admin so it can't conflict. Keep /api.
- Add `X-Robots-Tag: noindex, nofollow` for `/admin-ui/:path*`.
- Do NOT edit or reformat index.html, except the two lines in step 3.

## 2. Write the Supabase adapter: public/admin-ui/supabase-store.js
index.html checks `window.__MGRH_EXTERNAL_STORE`. If it's true, the built-in browser store switches itself off. The UI waits (by polling) until `window.MGRHStore` exists, then boots with whatever it holds. So the adapter must:

1. Load supabase-js (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`) and create a client with the PUBLIC url and anon key. Never use the service-role key.
2. Fetch everything from Supabase first. ONLY THEN assign `window.MGRHStore = { ... }` with this exact API:
   - `KEY, uid(prefix), now()`
   - `load()`: returns the cached db object, synchronously. It must have the same shape and field names as the built-in store's seed (see the field reference below).
   - `commit(nextDb)`: diff against the cache; upsert changed rows and delete removed rows in doctors / facilities / events / categories / media / activity; update the cache; call every subscriber with the new db. Throw on error.
   - `subscribe(fn)` → returns an unsubscribe function.
   - `session()`: `{ email, name, role }` of the signed-in Supabase user (role from `profiles`), or null.
   - `setSession(u)` / `clearSession()`: cache only (Supabase owns the real session).
   - `signIn(email, password)`: `supabase.auth.signInWithPassword`. Then read `profiles` (full_name, role), refetch data, and resolve `{ email, name, role }`. Reject on error. index.html already calls this when it exists.
   - `signOut()`: `supabase.auth.signOut()`.
   - `updatePassword(pw)`: `supabase.auth.updateUser({ password: pw })`.
   - `seed()` / `reset()`: return the current Supabase data. Never wipe the database.
   - `mediaSrc(id)`: return the media item's `src`.
   - `published(type)`: return rows of that type with status `published`.
3. Images: if a media item's `src` is a `data:` URL when committed, upload it to the `media` storage bucket and replace `src` with its public URL before saving.

Field reference: the built-in store's seed() uses these fields. Map the Supabase columns to them.
- **doctors:** id, name, designation, speciality, qualifications, experience, bio, schedule, location, photo (media id), order, status ('draft' or 'published'), createdAt, updatedAt, updatedBy
- **facilities:** id, name, category, short, full, subcategory, subitems [{name, text}], images [{mediaId, caption, alt}], review (bool), order, status, timestamps
- **events:** id, title, category, date (YYYY-MM-DD), venue, summary, shotLabels (number), images, order, status, timestamps
- **media:** id, name, src, width, height, size, type, uploadedAt, preset
- **activity:** id, at, who, action, type, title
- **settings:** { users: [{email, name, role}], categories: { doctors:[], facilities:[], events:[] }, editorsCanPublish }
- **version:** 1

If a field is unclear, open index.html in a browser, sign in with the built-in demo login (admin@mgrh-mahabaleshwar.org / mgrh-admin), and inspect `MGRHStore.load()` in the console.

## 3. Turn the adapter on
At the very top of `<head>` in public/admin-ui/index.html, add exactly these two lines and nothing else:
```html
<script>window.__MGRH_EXTERNAL_STORE = true;</script>
<script src="/admin-ui/supabase-store.js"></script>
```

## 4. Test
- `npm run dev`, then open /admin. It must look identical to double-clicking index.html.
- Sign in as mgrh@admin.com / admin123.
- Edit a doctor and save, then refresh the page. The change must still be there, and must show in the Supabase table.
- Upload a photo. It must appear in Storage → media.
- Report anything that differs from the design.
