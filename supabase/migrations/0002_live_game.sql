-- Milestone 3: adds the MLB live-game attachment to existing rooms tables.
-- Only needed if your project's `rooms` table was created before this
-- migration — a fresh `schema.sql` run already includes these columns.
-- Safe to re-run.

alter table public.rooms add column if not exists mlb_game_pk bigint;
alter table public.rooms add column if not exists mlb_game_label text;
