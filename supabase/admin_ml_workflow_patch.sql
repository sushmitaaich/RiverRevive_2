alter table public.garbage_reports
  add column if not exists ml_annotated_image_url text;

alter table public.cleaning_events
  add column if not exists event_location text;

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

alter table public.garbage_reports enable row level security;
alter table public.cleaning_events enable row level security;
alter table public.event_volunteers enable row level security;
alter table public.points_ledger enable row level security;

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
