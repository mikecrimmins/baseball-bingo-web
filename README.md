# Baseball Bingo (web) ⚾

A second-screen bingo game for watching baseball with friends — mark in-game
events on a bingo card as they happen. Built with Vite, React, TypeScript, and
Tailwind CSS.

This is the **web** build; a companion native app (Expo/React Native) lives
separately at `../baseball-bingo`. The two share game-design ideas but are
independent codebases.

## Status

**Milestone 1 (solo play) — done.** Multiplayer rooms (Milestone 2) and live
MLB game assist (Milestone 3) are not built yet.

## Features so far

- Pick a **3×3 quick game** or **5×5 full game**, generated from a 40-event
  library (no repeats, FREE center space).
- Mark cells by tapping; bingo (row/column/diagonal) and blackout (5×5 only)
  detection with a celebration overlay.
- Progress and card persist to `localStorage`, so a refresh mid-game restores
  where you left off.
- Responsive: desktop/tablet layout reserves a right-hand sidebar column for
  the live event feed (Milestone 3); phones stack to a single column.
- Installable as a PWA (manifest + service worker) so tablets can add it to
  the home screen and tolerate brief connection drops.

## Prerequisites

- Node 18+ (developed on Node 24)

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL. No environment variables or backend are needed
for solo play.

## Testing

Game logic (card generation, win/blackout detection) has unit tests:

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
  lib/__tests__/  vitest unit tests
  store/          gameStore (zustand + localStorage persistence)
  components/     BingoCard, BingoCell, WinBanner, GameLayout
  pages/          Landing, SoloGame
scripts/
  gen-icons.mjs   regenerates public/icons/* and public/favicon.svg
public/
  manifest.webmanifest, sw.js, icons/   PWA assets
```

## Deployment

Deployed on [Vercel](https://vercel.com), connected to this repo's `main`
branch — every `git push` triggers a new deploy. Build command `npm run
build`, output directory `dist`, no environment variables required yet.

To set up your own instance: import the repo in the Vercel dashboard (or
`vercel link` + `vercel --prod`), no config beyond the defaults above.

## Roadmap

- **Milestone 2** — multiplayer rooms via Supabase Realtime (room codes,
  caller mode, roster/progress panel). Will need `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_ANON_KEY` env vars once built.
- **Milestone 3** — live game assist via the MLB Stats API, filling the
  reserved sidebar with a play-by-play feed and confirm-to-mark prompts.
