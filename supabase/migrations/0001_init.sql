-- MyHQ rebuild: initial schema, row-level security and account deletion.
-- Paste the whole file into the Supabase SQL editor of the NEW project and run it once.
-- It uses plain CREATE TABLE (no IF NOT EXISTS) on purpose: if any of these tables
-- already exist, it stops with an error instead of touching them.
--
-- HQ formula (CORE IP, never change):
--   water:      hq = (volume_ml / 500) * (concentration_mg_l / 1.6)
--   inhalation: hq = (minutes / 30) * (h2_flow_ml_min / 300) * 2
-- Stored at full precision in a generated column; only the app rounds, for display (R-039).

begin;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text check (char_length(display_name) <= 80),
  language          text not null default 'en' check (language in ('en', 'zh-TW')),
  volume_units      text not null default 'ml' check (volume_units in ('ml')),
  default_device_id uuid,
  onboarded_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------- devices
-- One row per device, or per mode of a switchable unit (mode_label names the mode).
-- Inhalation devices carry HYDROGEN flow at the machine outlet in mL/min (R-201).
-- There is no purity column, by design (G1, R-091). lint-allow
create table public.devices (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name               text not null check (char_length(name) between 1 and 80),
  route              text not null check (route in ('water', 'inhalation')),
  h2_flow_ml_min     numeric check (h2_flow_ml_min > 0 and h2_flow_ml_min <= 10000),
  concentration_mg_l numeric check (concentration_mg_l > 0 and concentration_mg_l <= 20),
  mode_label         text check (char_length(mode_label) <= 60),
  is_default         boolean not null default false,
  archived           boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint devices_route_fields check (
    (route = 'inhalation' and h2_flow_ml_min is not null and concentration_mg_l is null)
    or (route = 'water' and concentration_mg_l is not null and h2_flow_ml_min is null)
  ),
  constraint devices_id_user unique (id, user_id)
);

create index devices_user_idx on public.devices (user_id);

alter table public.profiles
  add constraint profiles_default_device_fk
  foreign key (default_device_id, id) references public.devices (id, user_id)
  on delete set null (default_device_id);

-- ----------------------------------------------------------------- entries
create table public.entries (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  device_id          uuid,
  route              text not null check (route in ('water', 'inhalation')),
  session_start      timestamptz not null,
  local_date         date not null,               -- calendar day in the user's own time zone at logging
  tz                 text not null check (char_length(tz) between 1 and 64),
  minutes            numeric check (minutes > 0 and minutes <= 1440),
  h2_flow_ml_min     numeric check (h2_flow_ml_min > 0 and h2_flow_ml_min <= 10000),  -- snapshot at logging
  volume_ml          numeric check (volume_ml > 0 and volume_ml <= 5000),           -- volume CONSUMED (D8)
  concentration_mg_l numeric check (concentration_mg_l > 0 and concentration_mg_l <= 20), -- snapshot at logging
  hq                 numeric generated always as (
                       case route
                         when 'water'      then (volume_ml / 500.0) * (concentration_mg_l / 1.6)
                         when 'inhalation' then (minutes / 30.0) * (h2_flow_ml_min / 300.0) * 2
                       end
                     ) stored,
  notes              text check (char_length(notes) <= 500),
  source             text not null default 'app' check (source in ('app', 'guest', 'import')),
  client_request_id  uuid not null,               -- double-save guard
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint entries_route_fields check (
    (route = 'water' and volume_ml is not null and concentration_mg_l is not null
       and minutes is null and h2_flow_ml_min is null)
    or (route = 'inhalation' and minutes is not null and h2_flow_ml_min is not null
       and volume_ml is null and concentration_mg_l is null)
  ),
  constraint entries_request_unique unique (user_id, client_request_id),
  -- A device can only be referenced by its own owner.
  constraint entries_device_fk foreign key (device_id, user_id)
    references public.devices (id, user_id) on delete set null (device_id)
);

create index entries_user_date_idx on public.entries (user_id, local_date desc, session_start desc);

-- ------------------------------------------------------------- updated_at
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger devices_touch  before update on public.devices  for each row execute function public.touch_updated_at();
create trigger entries_touch  before update on public.entries  for each row execute function public.touch_updated_at();

-- Owner cannot be changed on update.
create function public.lock_user_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'user_id cannot be changed';
  end if;
  return new;
end;
$$;

create trigger devices_lock_owner before update on public.devices for each row execute function public.lock_user_id();
create trigger entries_lock_owner before update on public.entries for each row execute function public.lock_user_id();

-- ---------------------------------------------- profile on sign-up (server)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, language)
  values (
    new.id,
    case when new.raw_user_meta_data ->> 'language' = 'zh-TW' then 'zh-TW' else 'en' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------ row-level security
alter table public.profiles enable row level security;
alter table public.devices  enable row level security;
alter table public.entries  enable row level security;

-- profiles: own row only. Rows are created by the sign-up trigger and removed by account deletion.
create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- devices and entries: select, insert, update, delete only where user_id = auth.uid().
create policy devices_select on public.devices for select to authenticated using (user_id = (select auth.uid()));
create policy devices_insert on public.devices for insert to authenticated with check (user_id = (select auth.uid()));
create policy devices_update on public.devices for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy devices_delete on public.devices for delete to authenticated using (user_id = (select auth.uid()));

create policy entries_select on public.entries for select to authenticated using (user_id = (select auth.uid()));
create policy entries_insert on public.entries for insert to authenticated with check (user_id = (select auth.uid()));
create policy entries_update on public.entries for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy entries_delete on public.entries for delete to authenticated using (user_id = (select auth.uid()));

-- Table privileges: signed-in users only. The anon (logged-out) role gets nothing.
revoke all on public.profiles, public.devices, public.entries from anon, public;
grant select, update                 on public.profiles to authenticated;
grant select, insert, update, delete on public.devices  to authenticated;
grant select, insert, update, delete on public.entries  to authenticated;

revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.lock_user_id()     from public, anon, authenticated;
revoke all on function public.handle_new_user()  from public, anon, authenticated;

-- ------------------------------------------------------- delete my account
-- Runs on the server with elevated rights; the browser can only ask it to delete the caller.
-- Profiles, devices and entries go with the auth user (on delete cascade).
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

commit;
