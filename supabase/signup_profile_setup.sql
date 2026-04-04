alter table public.profiles
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists role text not null default 'citizen',
  add column if not exists location text,
  add column if not exists organization text,
  add column if not exists approved boolean not null default false,
  add column if not exists status text not null default 'pending_approval',
  add column if not exists points integer not null default 0,
  add column if not exists phone_number text;

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

alter table public.profiles enable row level security;

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