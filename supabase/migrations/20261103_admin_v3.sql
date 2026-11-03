-- MGRH content admin v3
-- Adds the small number of fields the new content-admin design needs.
-- Safe to run more than once. Nothing is dropped.

-- ---------- categories: tagline used by facility sections ----------
alter table public.categories
  add column if not exists tagline text not null default '';

-- Fill the taglines the current Facilities page already shows. Only touches empty rows.
update public.categories as c
set tagline = v.tagline
from (values
  ('Emergency & Critical Care', 'Immediate treatment and close monitoring.'),
  ('Consultation & Clinics', 'Where most visits begin with examinations and everyday care.'),
  ('Diagnostics', 'Tests and imaging that let treatment begin without delay.'),
  ('Surgery', 'Newly renovated theatres for major and minor procedures.'),
  ('Maternity & Child Care', 'Support through pregnancy, delivery and childhood.'),
  ('Wards & Support Services', 'Inpatient beds, medicines and everyday patient amenities.')
) as v(name, tagline)
where c.kind = 'facilities' and c.name = v.name and c.tagline = '';

-- ---------- facilities: "Additional Facilities" flag + captions for empty slots ----------
alter table public.facilities
  add column if not exists extra boolean not null default false;

-- The design does not count this row as one of the hospital's departments.
update public.facilities
set extra = true
where lower(name) = lower('Additional Facilities') and extra is distinct from true;

alter table public.facilities
  add column if not exists slot_captions text[] not null default '{}';

-- ---------- events: featured flag ----------
alter table public.events
  add column if not exists featured boolean not null default false;

-- ---------- support staff (Nursing & support staff list on the Doctors page) ----------
create table if not exists public.support_staff (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  count text not null default '',
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.support_staff enable row level security;

drop policy if exists pub_support_read on public.support_staff;
create policy pub_support_read on public.support_staff
  for select using (true);

drop policy if exists staff_support_write on public.support_staff;
create policy staff_support_write on public.support_staff
  for all using (public.is_staff()) with check (public.is_staff());

grant select on public.support_staff to anon, authenticated;
grant insert, update, delete on public.support_staff to authenticated;

-- Seed the rows the current website already shows, only when the table is empty.
insert into public.support_staff (title, count, description, sort_order)
select v.title, v.count, v.description, v.sort_order
from (values
  ('Nursing staff', '15', 'Ward, casualty and theatre nursing cover in rotating shifts, day and night.', 1),
  ('Paramedical staff', '10', 'Laboratory technicians, radiographers and pharmacy staff supporting diagnostics and dispensing.', 2),
  ('Health workers', '9', 'ANMs and community health workers running village clinics, immunisation booths and home visits.', 3),
  ('Administration & housekeeping', '16', 'The hospital is supported by administrative staff, registration and records staff, ambulance drivers, and housekeeping staff who help keep the hospital running smoothly.', 4)
) as v(title, count, description, sort_order)
where not exists (select 1 from public.support_staff);
