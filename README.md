# Baseball Bingo (web) ⚾

A second-screen bingo game for watching baseball with friends — mark in-game
events on a bingo card as they happen. Built with Vite, React, TypeScript, and
Tailwind CSS.

This is the **web** build; a companion native app (Expo/React Native) lives
separately at `../baseball-bingo`. The two share game-design ideas but are
independent codebases, including separate Supabase projects.

## Status

**Milestones 1 (solo play) and 2 (multiplayer rooms) — done.** Live MLB game
assist (Milestone 3) is not built yet.

## Features so far

- Pick a **3×3 quick game** or **5×5 full game**, generated from a 40-event
  library (no repeats, FREE center space).
- Mark cells by tapping; bingo (row/column/diagonal) and blackout (5×5 only)
  detection with a celebration overlay.
- Progress and card persist to `localStorage`, so a refresh mid-game restores
  where you left off.
- **Multiplayer rooms**: host gets a 4-letter code and a shareable link;
  friends join with a display name, no accounts. Everyone gets their own card
  from the same event pool, synced live via Supabase Realtime.
- **Caller mode**: the host can also be the caller — they see the full event
  list and tap plays as they happen. A called event pulses "confirm to mark?"
  on every matching card; marking is always a manual tap (never silent
  auto-mark), and players can mark any cell manually regardless of what's
  been called.
- **Roster panel** shows everyone in the room and how close they are
  ("needs 2"); a bingo/blackout broadcasts to the whole room by name.
  Refreshing mid-game restores your card, marks, and room via a
  browser-local player id — no re-entering your name.
  Rooms expire a few hours after their last activity (hourly cleanup job).
- Responsive: desktop/tablet layout reserves a right-hand sidebar column for
  the live event feed (Milestone 3) — currently used for the roster panel;
  phones stack to a single column.
- Installable as a PWA (manifest + service worker) so tablets can add it to
  the home screen and tolerate brief connection drops.

## Prerequisites

- Node 18+ (developed on Node 24)

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL. Solo play works with no configuration; see below
to enable multiplayer.

## Multiplayer setup (Supabase)

Without Supabase configured, the app still runs fully — solo play works, and
the Host/Join screens show a friendly setup notice instead of crashing.

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `rooms` and `players` tables, enables Realtime on both, adds permissive RLS
   policies for the anonymous role (no login — room codes only), and schedules
   an hourly job to delete rooms inactive for 6+ hours.
3. In **Project Settings → API**, copy the **Project URL** and the
   **`anon`/`public`** key (or **publishable** key, in newer dashboards —
   same thing, safe to ship in a client app). Never use the **`service_role`**
   or **secret** key here — that one bypasses RLS entirely.
4. Copy `.env.example` to `.env.local` and fill them in:

   ```bash
   cp .env.example .env.local
   ```

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
   ```

5. Restart the dev server so Vite picks up the env vars.

For a deployed instance, add the same two variables in the Vercel project's
**Settings → Environment Variables** (Production, Preview, and Development).

### Data model

The room is split across two tables so writers never conflict — each player
updates only their own `players` row, while the host/caller updates the
`rooms` row. The client reassembles the full room object on each realtime
change:

```ts
Room {
  roomCode, status, hostId, callerMode, size,
  players: { [id]: { name, card[size*size], marked[size*size], hasBingo, hasBlackout, isCaller } },
  calledEvents: string[],   // caller mode only
  startedAt, endedAt,
}
```

The sync layer is isolated in [`src/lib/roomSync.ts`](src/lib/roomSync.ts) —
swap it for another backend without touching the UI. Room membership persists
via a `playerId` generated once per browser and stored in `localStorage` (see
[`src/store/roomStore.ts`](src/store/roomStore.ts)) — that id, plus the room
code already in the URL, is what makes a refresh restore your session.

## Testing

Game logic (card generation, win/blackout detection, roster progress) has
unit tests:

```bash
npm test
```

Type-check:

```bash
npx tsc -b
```

## Project structure

```
src/
  lib/            events, cardGen, bingoDetect, useBingoGame, roomCode, types
                  (pure TS, no DOM — portable to a future native build)
  lib/            supabase, roomSync, useRoom, useRoomSession — multiplayer
  lib/__tests__/  vitest unit tests
  store/          gameStore (solo), roomStore (multiplayer device identity)
  components/     BingoCard, BingoCell, WinBanner, GameLayout,
                  RosterPanel, AnnouncementBanner
  pages/          Landing, SoloGame
  pages/multiplayer/  HostRoom, JoinRoom, Lobby, RoomGame, Caller
public/
  manifest.webmanifest, sw.js, icons/, favicon.svg   PWA assets
supabase/
  schema.sql      rooms/players tables, realtime, RLS, expiry cleanup
```

App icons and favicon come from a designer-drawn mark, recolored to the app's
navy/gold/cream palette in `scripts/gen-icons.mjs` — the ring/seam/bg colors
are parameters at the top of that script, so a palette tweak is a one-line
change followed by `node scripts/gen-icons.mjs`. For a genuinely new mark
shape, replace the SVG path data in the script's `mark()` function (or
hand-place new exports with the same filenames/sizes: favicon.svg 64×64
vector, icon-192/512 and maskable-512 square PNGs, apple-touch-icon.png
180×180) — keep the mark within the center ~66% of the frame so it survives
Android's maskable crop.

## Deployment

Deployed on [Vercel](https://vercel.com), connected to this repo's `master`
branch — every `git push` triggers a new deploy. Build command `npm run
build`, output directory `dist`. Needs the two `VITE_SUPABASE_*` environment
variables (above) for multiplayer; solo play works without them.

To set up your own instance: import the repo in the Vercel dashboard (or
`vercel link` + `vercel --prod`), add the environment variables, redeploy.

## Roadmap

- **Milestone 3** — live game assist via the MLB Stats API, filling the
  reserved sidebar with a play-by-play feed and confirm-to-mark prompts (the
  same interaction pattern the caller's called-events already use).
