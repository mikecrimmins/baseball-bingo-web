-- Baseball Bingo (web) — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- Two tables. Each writer owns distinct rows so there are no write conflicts:
--   * a player updates only their own `players` row
--   * the host/caller updates the `rooms` row
-- The app reassembles the full room from both tables and refetches on any
-- realtime change.
--
-- There is no auth in this app (room codes only), so RLS policies below allow
-- the anon role full access. This is intentional for a casual party game with
-- no sensitive data. Tighten if your needs differ.

-- ---------------------------------------------------------------- tables

create table if not exists public.rooms (
  room_code     text primary key,
  status        text not null default 'waiting',  -- waiting | active | ended
  host_id       text not null,
  caller_mode   boolean not null default false,
  size          smallint not null default 5,       -- 3 or 5 (card side length)
  called_events jsonb not null default '[]'::jsonb,
  started_at    bigint,
  ended_at      bigint,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.players (
  id           text primary key,
  room_code    text not null references public.rooms(room_code) on delete cascade,
  name         text not null,
  card         jsonb not null,           -- size*size event objects
  marked       jsonb not null,           -- size*size booleans
  has_bingo    boolean not null default false,
  has_blackout boolean not null default false,
  is_caller    boolean not null default false,
  joined_at    bigint not null
);

create index if not exists players_room_code_idx on public.players (room_code);

-- Bump `updated_at` on any change to a room (status flips, called_events) so
-- the expiry cleanup below is based on last activity, not just creation time.
create or replace function public.touch_room_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rooms_touch_updated_at on public.rooms;
create trigger rooms_touch_updated_at
  before update on public.rooms
  for each row execute function public.touch_room_updated_at();

-- ---------------------------------------------------------------- realtime

-- Emit full old-row data on UPDATE/DELETE so room_code filters match.
alter table public.rooms   replica identity full;
alter table public.players replica identity full;

-- Add both tables to the realtime publication (ignore if already added).
do $$
begin
  begin
    alter publication supabase_realtime add table public.rooms;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.players;
  exception when duplicate_object then null;
  end;
end $$;

-- ---------------------------------------------------------------- RLS

alter table public.rooms   enable row level security;
alter table public.players enable row level security;

drop policy if exists rooms_anon_all   on public.rooms;
drop policy if exists players_anon_all on public.players;

create policy rooms_anon_all   on public.rooms   for all
  to anon using (true) with check (true);
create policy players_anon_all on public.players for all
  to anon using (true) with check (true);

-- ---------------------------------------------------------------- expiry

-- Rooms expire a few hours after their last activity (room-row updates —
-- status changes, caller taps). Requires the pg_cron extension, available on
-- all Supabase projects; this schedules an hourly cleanup job. cron.schedule
-- upserts by job name, so re-running this file is safe.
create extension if not exists pg_cron;

select cron.schedule(
  'baseball-bingo-room-cleanup',
  '0 * * * *', -- hourly
  $$ delete from public.rooms where updated_at < now() - interval '6 hours'; $$
);
