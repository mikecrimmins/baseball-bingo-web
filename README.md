# Baseball Bingo (web) ⚾

**Live at [playbaseballbingo.com](https://playbaseballbingo.com).**

A second-screen bingo game for watching baseball with friends — mark in-game
events on a bingo card as they happen. Built with Vite, React, TypeScript, and
Tailwind CSS.

This is the **web** build; a companion native app (Expo/React Native) lives
separately at `../baseball-bingo`. The two share game-design ideas but are
independent codebases, including separate Supabase projects.

## Status

**All three milestones are done**: solo play, multiplayer rooms, and live
MLB game assist. The app has also been through a full **vintage ballpark
visual restyle** — see below.

## Design

The look is old ballpark ticket stock, not a scoreboard app: cream paper
(`--color-paper`/`--color-paper-bright`, never pure white), deep navy ink
(`--color-navy`), and a single stitch-red accent (`--color-stitch-red`) used
sparingly — status badges, dashed "called" borders, the mark stamp — never as
a body-text color. Depth comes from a hard 2px offset shadow
(`.ticket-shadow`, a print-misregistration look), never a soft blur; corners
stay sharp (`rounded`/`rounded-[3px]`, no big radii).

Three typefaces, each with one job: **Ultra** for display headlines and mode
names only, always uppercase (enforced by the `.headline` utility so no call
site has to remember to caps it), **Graduate** for eyebrows/buttons/labels,
and **Barlow Condensed** for body copy and card cell text.

Four shared motifs carry the theme everywhere:
- **`Ticket`** ([src/components/Ticket.tsx](src/components/Ticket.tsx)) — the
  signature component. A perforated ticket stub with a slight tilt that
  straightens and lifts on hover, and flattens to 0° once cards stack under
  the `sm` breakpoint. Used for the landing page's game-mode picker, the
  lobby's room code, and the join screen's code entry.
- **`PennantBanner`** ([src/components/PennantBanner.tsx](src/components/PennantBanner.tsx))
  — a pointed-both-ends navy banner (`clip-path` polygon) replacing the old
  gold celebration box for the win banner and room announcements.
- **`StampBadge`** ([src/components/StampBadge.tsx](src/components/StampBadge.tsx))
  — a small rotated rubber-stamp label (Host/Caller/Called).
  - **`StitchDivider`** ([src/components/StitchDivider.tsx](src/components/StitchDivider.tsx))
  — a dashed SVG curve used as a section break.

Bingo cells stay `paper-bright` whether marked or not (readability over
drama); a mark renders as a rotated stitch-red ring "stamp" instead of a
solid fill, and the winning line gets a red cell border on top of that. FREE
is the logo mark, not text. The Caller view reads as a lineup card — a
numbered list of plays, not a button grid.

One deliberate deviation from the original design brief: `--color-ink-faint`
is `#726A52`, not the brief's literal `#8A8267` — that value only clears
~3.3:1 contrast against paper (fails WCAG AA for small text); the shipped
value clears 4.7:1. Every other themed color pair checked passes AA or
better (navy/paper 12.4:1, ink-muted/paper 6.65:1, stitch-red/paper 5.1:1,
paper-bright/navy 14:1).

Accessibility floor: every interactive element gets a 2px solid navy
`:focus-visible` outline (no per-element opt-in needed — it's global in
[`src/index.css`](src/index.css)), and the four themed animations (card
stamp, banner entrance, called-cell pulse, ticket tear) all collapse to `none`
under `prefers-reduced-motion: reduce`.

PWA icons (`public/favicon.svg`, `public/icons/*`) are generated from the
same palette by [`scripts/gen-icons.mjs`](scripts/gen-icons.mjs) — see that
file if the palette changes again.

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
- **Live game assist**: attach today's actual MLB game (solo, or room-wide —
  the host attaches it and everyone sees the same feed) and the sidebar
  becomes a live score/inning/recent-plays panel, polling the free MLB Stats
  API every 15s. When the feed detects an event matching a square, that cell
  pulses the same "confirm to mark?" prompt as caller mode — never a silent
  auto-mark. Not every square is detectable from the feed (see
  `mlbEventMapping.ts`); those stay manual-only, and the game is always fully
  playable by hand if the feed is slow or unavailable.
- Installable as a PWA (manifest + service worker) so tablets can add it to
  the home screen and tolerate brief connection drops.

## Prerequisites

- Node 18+ (developed on Node 24)

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL. Solo play — including the live MLB feed — works
with no configuration; see below to enable multiplayer.

## Multiplayer setup (Supabase)

Without Supabase configured, the app still runs fully — solo play works, and
the Host/Join screens show a friendly setup notice instead of crashing.

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the
   `rooms` and `players` tables, enables Realtime on both, adds permissive RLS
   policies for the anonymous role (no login — room codes only), and schedules
   an hourly job to delete rooms inactive for 6+ hours.

   If you set up multiplayer before Milestone 3, you already have this table
   and only need the new bits — run the files in
   [`supabase/migrations/`](supabase/migrations/) in order instead of the
   full schema. `0003_players_composite_key.sql` in particular fixes a real
   bug: the `players` table's primary key was `id` alone (a device-persistent
   id), so the same browser could never host or join a *second* room without
   leaving the first — worth applying even if you don't care about live game
   assist.
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
  calledEvents: string[],           // caller mode
  mlbGamePk, mlbGameLabel,          // live game assist, host-controlled
  startedAt, endedAt,
}
```

The sync layer is isolated in [`src/lib/roomSync.ts`](src/lib/roomSync.ts) —
swap it for another backend without touching the UI. Room membership persists
via a `playerId` generated once per browser and stored in `localStorage` (see
[`src/store/roomStore.ts`](src/store/roomStore.ts)) — that id, plus the room
code already in the URL, is what makes a refresh restore your session. A
player's row is unique per `(id, room_code)`, not globally, so the same
browser can be in many rooms over its lifetime.

### MLB Stats API

Free, unauthenticated, no key — see [`src/lib/mlbApi.ts`](src/lib/mlbApi.ts).
MLB's terms limit it to individual/non-commercial/non-bulk use, which this
is. The event-type → bingo-square mapping in
[`src/lib/mlbEventMapping.ts`](src/lib/mlbEventMapping.ts) is verified
against the API's own canonical list (`/v1/eventTypes`) plus real sampled
games, not guessed — see that file's comments for exactly which squares are
detectable and which stay manual (things like inside-the-park-HR-vs-regular
or pinch-hit-vs-pinch-run aren't distinguishable in the feed at this level of
detail). [`src/lib/useLiveGame.ts`](src/lib/useLiveGame.ts) polls every 15s
and degrades silently on any fetch failure — manual play is never blocked by
the API being slow or down.

## Testing

Game logic (card generation, win/blackout detection, roster progress, MLB
event mapping) has unit tests:

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
  lib/            mlbApi, mlbEventMapping, useLiveGame, useLiveGameControl
  lib/__tests__/  vitest unit tests
  store/          gameStore (solo), roomStore (multiplayer device identity)
  components/     BingoCard, BingoCell, WinBanner, GameLayout,
                  RosterPanel, AnnouncementBanner, GamePicker, LiveFeedPanel
  pages/          Landing, SoloGame
  pages/multiplayer/  HostRoom, JoinRoom, Lobby, RoomGame, Caller
public/
  manifest.webmanifest, sw.js, icons/, favicon.svg   PWA assets
supabase/
  schema.sql      rooms/players tables, realtime, RLS, expiry cleanup
  migrations/     incremental changes for already-running projects
```

App icons and favicon come from a designer-drawn mark, recolored to the app's
paper/navy/stitch-red palette in `scripts/gen-icons.mjs` — the ring/seam/bg
colors are parameters at the top of that script, so a palette tweak is a one-line
change followed by `node scripts/gen-icons.mjs`. For a genuinely new mark
shape, replace the SVG path data in the script's `mark()` function (or
hand-place new exports with the same filenames/sizes: favicon.svg 64×64
vector, icon-192/512 and maskable-512 square PNGs, apple-touch-icon.png
180×180) — keep the mark within the center ~66% of the frame so it survives
Android's maskable crop.

## Deployment

Deployed on [Vercel](https://vercel.com), connected to this repo's `master`
branch — every `git push` triggers a new deploy. Build command `npm run
build`, output directory `dist`, `vercel.json` has the SPA rewrite client-side
routes need. Needs the two `VITE_SUPABASE_*` environment variables (above)
for multiplayer; solo play (including live game assist) works without them.

To set up your own instance: import the repo in the Vercel dashboard (or
`vercel link` + `vercel --prod`), add the environment variables, redeploy.
