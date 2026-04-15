create table if not exists public.counters (
  id integer primary key,
  value integer not null default 0 check (value >= 0),
  updated_at timestamptz not null default timezone('utc', now())
);

insert into public.counters (id, value)
values (1, 0)
on conflict (id) do nothing;

alter table public.counters enable row level security;

drop policy if exists "Public can read counters" on public.counters;
create policy "Public can read counters"
on public.counters
for select
to anon
using (true);

create or replace function public.set_counter_value(next_value integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_value integer := greatest(coalesce(next_value, 0), 0);
  stored_value integer;
begin
  insert into public.counters (id, value, updated_at)
  values (1, safe_value, timezone('utc', now()))
  on conflict (id)
  do update
    set value = excluded.value,
        updated_at = excluded.updated_at
  returning value into stored_value;

  return stored_value;
end;
$$;

create or replace function public.increment_counter(delta_value integer default 1)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_delta integer := coalesce(delta_value, 0);
  stored_value integer;
begin
  insert into public.counters (id, value, updated_at)
  values (1, greatest(safe_delta, 0), timezone('utc', now()))
  on conflict (id)
  do update
    set value = greatest(public.counters.value + safe_delta, 0),
        updated_at = timezone('utc', now())
  returning value into stored_value;

  return stored_value;
end;
$$;

grant execute on function public.set_counter_value(integer) to anon;
grant execute on function public.increment_counter(integer) to anon;
