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
