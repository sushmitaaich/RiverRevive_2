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
