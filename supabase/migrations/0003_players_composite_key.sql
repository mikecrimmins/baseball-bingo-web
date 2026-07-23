-- Fixes a real bug (found while testing Milestone 3, but present since
-- Milestone 2): players.id alone was the primary key, so the same browser's
-- persistent playerId collided across DIFFERENT rooms — anyone who hosted or
-- joined a second game without first leaving the first got a 409 duplicate
-- key error. The player's identity only needs to be unique *within a room*.
-- Safe to re-run.

alter table public.players drop constraint if exists players_pkey;
alter table public.players add constraint players_pkey primary key (id, room_code);
