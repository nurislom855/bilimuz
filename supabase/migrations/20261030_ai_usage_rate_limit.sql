create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index on public.ai_usage(user_id, created_at);
-- RLS yoqilgan, siyosat yo'q: jadvalga faqat Edge Function (service role) yozadi/o'qiydi
alter table public.ai_usage enable row level security;
