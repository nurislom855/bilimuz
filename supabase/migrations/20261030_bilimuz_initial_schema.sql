create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.quiz_results (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  topic text not null,
  level text,
  total int not null,
  correct int not null,
  created_at timestamptz not null default now()
);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  role text not null check (role in ('user','model')),
  content text not null,
  created_at timestamptz not null default now()
);

create index on public.tasks(user_id);
create index on public.quiz_results(user_id);
create index on public.chat_messages(user_id, created_at);

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.quiz_results enable row level security;
alter table public.chat_messages enable row level security;

create policy "own profile select" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own tasks select" on public.tasks for select to authenticated using (user_id = (select auth.uid()));
create policy "own tasks insert" on public.tasks for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own tasks update" on public.tasks for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own tasks delete" on public.tasks for delete to authenticated using (user_id = (select auth.uid()));

create policy "own quiz select" on public.quiz_results for select to authenticated using (user_id = (select auth.uid()));
create policy "own quiz insert" on public.quiz_results for insert to authenticated with check (user_id = (select auth.uid()));

create policy "own chat select" on public.chat_messages for select to authenticated using (user_id = (select auth.uid()));
create policy "own chat insert" on public.chat_messages for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own chat delete" on public.chat_messages for delete to authenticated using (user_id = (select auth.uid()));

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
