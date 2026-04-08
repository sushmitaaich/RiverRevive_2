alter table public.garbage_reports
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

create index if not exists idx_garbage_reports_ml_status
  on public.garbage_reports (ml_status);

create index if not exists idx_garbage_reports_priority_level
  on public.garbage_reports (priority_level);
