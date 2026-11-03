-- MGRH content admin v3: signed-in name/role + edit history
-- activity_log already exists in this project. Nothing is dropped.
-- Safe to run more than once. NOT run yet.

-- ---------- activity_log: who did it, with which role, and which record ----------
alter table public.activity_log
  add column if not exists actor_role text not null default '';

alter table public.activity_log
  add column if not exists entity_id text;

-- ---------- content rows: show "Last changed by {name} ({role}) · {time}" ----------
-- updated_by already exists as a uuid, and updated_at already exists.
-- The browser no longer has a Supabase user id, so the display name is stored here.
alter table public.doctors
  add column if not exists updated_by_name text not null default '';
alter table public.doctors
  add column if not exists updated_by_role text not null default '';

alter table public.facilities
  add column if not exists updated_by_name text not null default '';
alter table public.facilities
  add column if not exists updated_by_role text not null default '';

alter table public.events
  add column if not exists updated_by_name text not null default '';
alter table public.events
  add column if not exists updated_by_role text not null default '';
