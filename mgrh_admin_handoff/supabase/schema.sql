-- MGRH website — Supabase schema
-- Run in the Supabase SQL editor (or as a migration) on a fresh project.

-- ---------- Roles ----------
create type public.staff_role as enum ('administrator', 'editor');
create type public.content_status as enum ('draft', 'published');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.staff_role not null default 'editor',
  created_at timestamptz not null default now()
);

create table public.settings (
  id int primary key default 1 check (id = 1),
  editors_can_publish boolean not null default false
);
insert into public.settings (id) values (1);

-- ---------- Helpers ----------
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'administrator');
$$;

create or replace function public.can_publish() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or (public.is_staff() and (select editors_can_publish from settings where id = 1));
$$;

-- ---------- Categories ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('doctors', 'facilities', 'events')),
  name text not null,
  sort_order int not null default 0,
  unique (kind, name)
);

-- ---------- Media ----------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null,          -- path inside the `media` bucket (cropped, web-ready JPEG)
  original_path text,                  -- path of the untouched upload, used for re-cropping
  width int, height int, size_bytes int,
  mime_type text not null default 'image/jpeg',
  preset text not null check (preset in ('doctor', 'facility', 'event')),
  crop jsonb,                          -- { zoom, x, y, rot } so the crop can be re-opened
  uploaded_by uuid references auth.users(id),
  uploaded_at timestamptz not null default now()
);

-- ---------- Doctors ----------
create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text not null default '',
  speciality text not null,
  qualifications text not null default '',
  experience text not null default '',
  bio text not null default '',
  schedule text not null default '',
  days text[] not null default '{}',
  start_time time, end_time time,
  location text not null default '',
  contact text not null default '',
  show_contact boolean not null default false,
  image_id uuid references public.media(id) on delete set null,
  image_alt text not null default '',
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint doctor_times check (end_time is null or start_time is null or end_time > start_time)
);

-- ---------- Facilities ----------
create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,              -- section on the Facilities page
  subcategory text not null default '',
  short_description text not null default '',
  full_description text not null default '',
  subitems jsonb not null default '[]', -- [{ name, text }]
  cover_index int not null default 0,
  needs_review boolean not null default false,
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.facility_images (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  caption text not null default '',
  alt text not null default '',
  sort_order int not null default 0
);

-- ---------- Events ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  event_date date, end_date date,
  start_time time, end_time time,
  venue text not null default '',
  summary text not null default '',
  description text not null default '',
  organiser text not null default '',
  highlights text not null default '',
  cover_id uuid references public.media(id) on delete set null,
  cover_alt text not null default '',
  placeholder_slots int not null default 0, -- empty photo slots shown until a gallery exists
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint event_dates check (end_date is null or event_date is null or end_date >= event_date)
);

create table public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  caption text not null default '',
  alt text not null default '',
  sort_order int not null default 0
);

-- ---------- Activity log ----------
create table public.activity_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid references auth.users(id),
  actor_name text not null default '',
  action text not null,     -- Added / Updated / Published / Unpublished / Deleted / Reordered / Uploaded image …
  entity_type text not null,
  entity_title text not null default ''
);

-- ---------- updated_at trigger ----------
create or replace function public.touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); new.updated_by = auth.uid(); return new; end $$;
create trigger t_doctors before update on public.doctors for each row execute function public.touch();
create trigger t_facilities before update on public.facilities for each row execute function public.touch();
create trigger t_events before update on public.events for each row execute function public.touch();

-- ---------- Row-level security ----------
alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.media enable row level security;
alter table public.doctors enable row level security;
alter table public.facilities enable row level security;
alter table public.facility_images enable row level security;
alter table public.events enable row level security;
alter table public.event_images enable row level security;
alter table public.activity_log enable row level security;

-- Public website (anon) sees only published content
create policy pub_doctors on public.doctors for select using (status = 'published' or public.is_staff());
create policy pub_facilities on public.facilities for select using (status = 'published' or public.is_staff());
create policy pub_events on public.events for select using (status = 'published' or public.is_staff());
create policy pub_fac_img on public.facility_images for select using (
  public.is_staff() or exists (select 1 from facilities f where f.id = facility_id and f.status = 'published'));
create policy pub_evt_img on public.event_images for select using (
  public.is_staff() or exists (select 1 from events e where e.id = event_id and e.status = 'published'));
create policy pub_media on public.media for select using (true);
create policy pub_categories on public.categories for select using (true);

-- Staff: create & edit. Publishing is enforced by the trigger below.
create policy staff_ins_doctors on public.doctors for insert with check (public.is_staff());
create policy staff_upd_doctors on public.doctors for update using (public.is_staff());
create policy staff_ins_fac on public.facilities for insert with check (public.is_staff());
create policy staff_upd_fac on public.facilities for update using (public.is_staff());
create policy staff_ins_evt on public.events for insert with check (public.is_staff());
create policy staff_upd_evt on public.events for update using (public.is_staff());
create policy staff_fac_img on public.facility_images for all using (public.is_staff()) with check (public.is_staff());
create policy staff_evt_img on public.event_images for all using (public.is_staff()) with check (public.is_staff());
create policy staff_media_ins on public.media for insert with check (public.is_staff());
create policy staff_media_upd on public.media for update using (public.is_staff());

-- Administrators only: delete, categories, settings, team
create policy admin_del_doctors on public.doctors for delete using (public.is_admin());
create policy admin_del_fac on public.facilities for delete using (public.is_admin());
create policy admin_del_evt on public.events for delete using (public.is_admin());
create policy admin_del_media on public.media for delete using (public.is_admin());
create policy admin_categories on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy read_settings on public.settings for select using (public.is_staff());
create policy admin_settings on public.settings for update using (public.is_admin());
create policy read_profiles on public.profiles for select using (public.is_staff());
create policy self_profile on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy admin_profiles on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy staff_log_read on public.activity_log for select using (public.is_staff());
create policy staff_log_ins on public.activity_log for insert with check (public.is_staff());

-- Only administrators may change a staff role.
create or replace function public.guard_profile_role() returns trigger language plpgsql as $$
begin
  if auth.role() = 'service_role' then return new; end if;
  if not public.is_admin() and new.role is distinct from old.role then
    raise exception 'Only administrators can change staff roles.';
  end if;
  return new;
end $$;
create trigger g_profiles before update on public.profiles for each row execute function public.guard_profile_role();

-- Stop editors from publishing unless allowed.
create or replace function public.guard_publish() returns trigger language plpgsql as $$
begin
  if auth.role() = 'service_role' then return new; end if;
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') and not public.can_publish() then
    raise exception 'Your role can save drafts but not publish.';
  end if;
  if tg_op = 'UPDATE' and old.status = 'published' and new.status = 'draft' and not public.can_publish() then
    raise exception 'Your role cannot unpublish.';
  end if;
  return new;
end $$;
create trigger g_doctors before insert or update on public.doctors for each row execute function public.guard_publish();
create trigger g_facilities before insert or update on public.facilities for each row execute function public.guard_publish();
create trigger g_events before insert or update on public.events for each row execute function public.guard_publish();

-- ---------- Storage ----------
-- Create a PUBLIC bucket named `media` in Storage, then:
create policy media_read on storage.objects for select using (bucket_id = 'media');
create policy media_write on storage.objects for insert with check (bucket_id = 'media' and public.is_staff());
create policy media_update on storage.objects for update using (bucket_id = 'media' and public.is_staff());
create policy media_delete on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ---------- Seed categories ----------
insert into public.categories (kind, name, sort_order) values
 ('doctors','Medicine',1),('doctors','Surgery',2),('doctors','Pediatrics',3),('doctors','Orthopedics',4),
 ('doctors','Anaesthesia',5),('doctors','Dental Surgeon',6),('doctors','General',7),
 ('facilities','Emergency & Critical Care',1),('facilities','Consultation & Clinics',2),('facilities','Surgery',3),
 ('facilities','Diagnostics',4),('facilities','Maternity & Child Care',5),('facilities','Wards & Support Services',6),
 ('events','Blood Donation',1),('events','Screening Camp',2),('events','School Clinic',3),('events','Immunization',4),('events','Awareness',5);

-- First administrator: create the user in Authentication → Users, then
-- insert into public.profiles (id, full_name, role) values ('<auth user id>', 'Hospital Administrator', 'administrator');
