create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('waste-report-images', 'waste-report-images', true)
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and approved = true
  );
$$;

alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text not null default 'citizen',
  add column if not exists location text,
  add column if not exists organization text,
  add column if not exists approved boolean not null default false,
  add column if not exists status text not null default 'pending_approval',
  add column if not exists points integer not null default 0,
  add column if not exists phone_number text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'phone'
  ) then
    update public.profiles
    set phone_number = coalesce(phone_number, phone)
    where phone_number is null
      and phone is not null;
  end if;
end $$;

update public.profiles
set
  role = coalesce(role, 'citizen'),
  approved = coalesce(approved, false),
  status = coalesce(status, 'pending_approval'),
  points = coalesce(points, 0)
where role is null
   or approved is null
   or status is null
   or points is null;

alter table public.profiles
  alter column points set default 0;

alter table public.garbage_reports
  add column if not exists description text,
  add column if not exists reported_latitude double precision,
  add column if not exists reported_longitude double precision,
  add column if not exists metadata_latitude double precision,
  add column if not exists metadata_longitude double precision,
  add column if not exists metadata_distance_m integer,
  add column if not exists metadata_status text not null default 'pending',
  add column if not exists verification_notes text,
  add column if not exists cleanup_event_id uuid,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists priority_level text,
  add column if not exists priority_score integer,
  add column if not exists ml_status text not null default 'pending',
  add column if not exists ml_detected boolean,
  add column if not exists ml_total_coverage double precision,
  add column if not exists ml_box_count integer,
  add column if not exists ml_confidence double precision,
  add column if not exists ml_detected_types text[] not null default '{}'::text[],
  add column if not exists ml_detections jsonb not null default '[]'::jsonb,
  add column if not exists ml_model_version text,
  add column if not exists ml_processed_at timestamptz,
  add column if not exists ml_notes text,
  add column if not exists ml_annotated_image_url text;

update public.garbage_reports
set status = 'pending'
where status is null;

alter table public.garbage_reports
  alter column status set default 'pending';

alter table public.cleaning_events
  add column if not exists primary_report_id uuid,
  add column if not exists status text not null default 'upcoming',
  add column if not exists required_volunteers integer not null default 0,
  add column if not exists event_location text,
  add column if not exists event_notes text,
  add column if not exists completion_notes text,
  add column if not exists completed_at timestamptz,
  add column if not exists created_by uuid,
  add column if not exists reporter_points integer not null default 0,
  add column if not exists volunteer_points integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cleaning_events_primary_report_id_fkey'
  ) then
    alter table public.cleaning_events
      add constraint cleaning_events_primary_report_id_fkey
      foreign key (primary_report_id) references public.garbage_reports(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cleaning_events_created_by_fkey'
  ) then
    alter table public.cleaning_events
      add constraint cleaning_events_created_by_fkey
      foreign key (created_by) references public.profiles(id) on delete set null;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'garbage_reports_cleanup_event_id_fkey'
  ) then
    alter table public.garbage_reports
      add constraint garbage_reports_cleanup_event_id_fkey
      foreign key (cleanup_event_id) references public.cleaning_events(id) on delete set null;
  end if;
end $$;

create table if not exists public.event_volunteers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.cleaning_events(id) on delete cascade,
  collector_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone_number text,
  source text not null default 'self',
  status text not null default 'registered',
  created_at timestamptz not null default now(),
  unique (event_id, collector_id)
);

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.cleaning_events(id) on delete set null,
  report_id uuid references public.garbage_reports(id) on delete set null,
  transaction_type text not null,
  points integer not null,
  note text,
  created_at timestamptz not null default now(),
  unique (profile_id, event_id, transaction_type)
);

create index if not exists idx_garbage_reports_reporter_id
  on public.garbage_reports (reporter_id);

create index if not exists idx_garbage_reports_status
  on public.garbage_reports (status);

create index if not exists idx_garbage_reports_ml_status
  on public.garbage_reports (ml_status);

create index if not exists idx_garbage_reports_priority_level
  on public.garbage_reports (priority_level);

create index if not exists idx_cleaning_events_status
  on public.cleaning_events (status);

create index if not exists idx_cleaning_events_primary_report_id
  on public.cleaning_events (primary_report_id);

create index if not exists idx_event_volunteers_event_id
  on public.event_volunteers (event_id);

create index if not exists idx_points_ledger_profile_id
  on public.points_ledger (profile_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_garbage_reports_updated_at on public.garbage_reports;
create trigger set_garbage_reports_updated_at
before update on public.garbage_reports
for each row execute function public.set_updated_at();

drop trigger if exists set_cleaning_events_updated_at on public.cleaning_events;
create trigger set_cleaning_events_updated_at
before update on public.cleaning_events
for each row execute function public.set_updated_at();

drop function if exists public.schedule_cleanup_event(uuid, timestamptz, integer, text, uuid);
drop function if exists public.schedule_cleanup_event(uuid, timestamptz, text, integer, text, uuid);
create or replace function public.schedule_cleanup_event(
  p_report_id uuid,
  p_scheduled_at timestamptz,
  p_event_location text,
  p_required_volunteers integer,
  p_event_notes text,
  p_created_by uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid := gen_random_uuid();
  v_report_address text;
  v_before_url text;
begin
  select
    address,
    coalesce(ml_annotated_image_url, images[1])
  into v_report_address, v_before_url
  from public.garbage_reports
  where id = p_report_id
  for update;

  insert into public.cleaning_events (
    id,
    primary_report_id,
    report_ids,
    scheduled_at,
    event_location,
    required_volunteers,
    status,
    event_notes,
    before_url,
    created_by
  )
  values (
    v_event_id,
    p_report_id,
    array[p_report_id]::uuid[],
    p_scheduled_at,
    coalesce(nullif(trim(p_event_location), ''), v_report_address),
    greatest(coalesce(p_required_volunteers, 0), 0),
    'upcoming',
    p_event_notes,
    v_before_url,
    p_created_by
  );

  update public.garbage_reports
  set
    status = 'scheduled',
    cleanup_event_id = v_event_id
  where id = p_report_id;

  return v_event_id;
end;
$$;

create or replace function public.complete_cleanup_event(
  p_event_id uuid,
  p_after_url text default null,
  p_completion_notes text default null,
  p_waste_kg jsonb default '{}'::jsonb,
  p_reporter_points integer default 0,
  p_volunteer_points integer default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report_id uuid;
  v_reporter_id uuid;
begin
  select primary_report_id
  into v_report_id
  from public.cleaning_events
  where id = p_event_id
  for update;

  if v_report_id is null then
    raise exception 'No report linked to event %', p_event_id;
  end if;

  update public.cleaning_events
  set
    status = 'completed',
    after_url = coalesce(p_after_url, after_url),
    completion_notes = coalesce(p_completion_notes, completion_notes),
    waste_kg = coalesce(p_waste_kg, waste_kg, '{}'::jsonb),
    completed_at = now(),
    reporter_points = greatest(coalesce(p_reporter_points, 0), 0),
    volunteer_points = greatest(coalesce(p_volunteer_points, 0), 0)
  where id = p_event_id;

  update public.garbage_reports
  set status = 'completed'
  where id = v_report_id
  returning reporter_id into v_reporter_id;

  with inserted_report_reward as (
    insert into public.points_ledger (
      profile_id,
      event_id,
      report_id,
      transaction_type,
      points,
      note
    )
    select
      v_reporter_id,
      p_event_id,
      v_report_id,
      'report_completion',
      greatest(coalesce(p_reporter_points, 0), 0),
      'Cleanup event completed for submitted report'
    where v_reporter_id is not null
      and greatest(coalesce(p_reporter_points, 0), 0) > 0
    on conflict (profile_id, event_id, transaction_type) do nothing
    returning profile_id, points
  )
  update public.profiles p
  set points = p.points + r.points
  from inserted_report_reward r
  where p.id = r.profile_id;

  with inserted_volunteer_rewards as (
    insert into public.points_ledger (
      profile_id,
      event_id,
      report_id,
      transaction_type,
      points,
      note
    )
    select
      ev.collector_id,
      p_event_id,
      v_report_id,
      'event_participation',
      greatest(coalesce(p_volunteer_points, 0), 0),
      'Participated in cleanup event'
    from public.event_volunteers ev
    where ev.event_id = p_event_id
      and ev.collector_id is not null
      and ev.status <> 'cancelled'
      and greatest(coalesce(p_volunteer_points, 0), 0) > 0
    on conflict (profile_id, event_id, transaction_type) do nothing
    returning profile_id, points
  )
  update public.profiles p
  set points = p.points + r.points
  from inserted_volunteer_rewards r
  where p.id = r.profile_id;

  update public.event_volunteers
  set status = case when status = 'cancelled' then status else 'completed' end
  where event_id = p_event_id;

  update public.cleaning_events
  set points_distributed =
    coalesce(p_reporter_points, 0) +
    (
      select coalesce(count(*), 0) * greatest(coalesce(p_volunteer_points, 0), 0)
      from public.event_volunteers
      where event_id = p_event_id
        and collector_id is not null
        and status = 'completed'
    )
  where id = p_event_id;

  return p_event_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.garbage_reports enable row level security;
alter table public.cleaning_events enable row level security;
alter table public.event_volunteers enable row level security;
alter table public.points_ledger enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "garbage_reports_select_own_or_admin" on public.garbage_reports;
create policy "garbage_reports_select_own_or_admin"
on public.garbage_reports
for select
to authenticated
using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists "garbage_reports_insert_own" on public.garbage_reports;
create policy "garbage_reports_insert_own"
on public.garbage_reports
for insert
to authenticated
with check (auth.uid() = reporter_id);

drop policy if exists "garbage_reports_update_admin" on public.garbage_reports;
create policy "garbage_reports_update_admin"
on public.garbage_reports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "cleaning_events_select_authenticated" on public.cleaning_events;
create policy "cleaning_events_select_authenticated"
on public.cleaning_events
for select
to authenticated
using (true);

drop policy if exists "cleaning_events_admin_all" on public.cleaning_events;
create policy "cleaning_events_admin_all"
on public.cleaning_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "event_volunteers_select_authenticated" on public.event_volunteers;
create policy "event_volunteers_select_authenticated"
on public.event_volunteers
for select
to authenticated
using (true);

drop policy if exists "event_volunteers_insert_self_or_admin" on public.event_volunteers;
create policy "event_volunteers_insert_self_or_admin"
on public.event_volunteers
for insert
to authenticated
with check (
  public.is_admin()
  or collector_id = auth.uid()
);

drop policy if exists "event_volunteers_update_self_or_admin" on public.event_volunteers;
create policy "event_volunteers_update_self_or_admin"
on public.event_volunteers
for update
to authenticated
using (
  public.is_admin()
  or collector_id = auth.uid()
)
with check (
  public.is_admin()
  or collector_id = auth.uid()
);

drop policy if exists "event_volunteers_delete_self_or_admin" on public.event_volunteers;
create policy "event_volunteers_delete_self_or_admin"
on public.event_volunteers
for delete
to authenticated
using (
  public.is_admin()
  or collector_id = auth.uid()
);

drop policy if exists "points_ledger_select_own_or_admin" on public.points_ledger;
create policy "points_ledger_select_own_or_admin"
on public.points_ledger
for select
to authenticated
using (
  public.is_admin()
  or profile_id = auth.uid()
);

do $$
begin
  begin
    alter publication supabase_realtime add table public.garbage_reports;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.cleaning_events;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.event_volunteers;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.points_ledger;
  exception
    when duplicate_object then null;
  end;
end $$;
