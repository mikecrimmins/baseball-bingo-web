import type { LiveFeedPlay } from './mlbApi';

/**
 * Maps our bingo event abbreviations to MLB Stats API `eventType` codes,
 * verified against the API's own canonical list
 * (https://statsapi.mlb.com/api/v1/eventTypes) plus ~500 real plays sampled
 * across several games. Not every square has a reliable signal — see
 * UNDETECTABLE below, which stay manual-only per the original spec.
 */
export const DIRECT_MAP: Record<string, string[]> = {
  K: ['strikeout', 'strike_out', 'strikeout_double_play', 'strikeout_triple_play'],
  HR: ['home_run'],
  BB: ['walk'],
  '1B': ['single'],
  '2B': ['double'],
  '3B': ['triple'],
  DP: [
    'double_play',
    'grounded_into_double_play',
    'strikeout_double_play',
    'sac_fly_double_play',
    'sac_bunt_double_play',
    'cs_double_play',
    'runner_double_play',
  ],
  SB: ['stolen_base', 'stolen_base_2b', 'stolen_base_3b', 'stolen_base_home'],
  E: ['error', 'field_error', 'pickoff_error_1b', 'pickoff_error_2b', 'pickoff_error_3b'],
  WP: ['wild_pitch'],
  PB: ['passed_ball'],
  HBP: ['hit_by_pitch'],
  SF: ['sac_fly', 'sac_fly_double_play'],
  SH: ['sac_bunt', 'sac_bunt_double_play'],
  CS: [
    'caught_stealing',
    'caught_stealing_2b',
    'caught_stealing_3b',
    'caught_stealing_home',
    'pickoff_caught_stealing_2b',
    'pickoff_caught_stealing_3b',
    'pickoff_caught_stealing_home',
  ],
  FC: ['fielders_choice', 'fielders_choice_out'],
  IBB: ['intent_walk'],
  BK: ['balk', 'forced_balk'],
  PO: ['pickoff_1b', 'pickoff_2b', 'pickoff_3b'],
  GDP: ['grounded_into_double_play'],
  REL: ['pitching_substitution', 'pitcher_switch'],
  CI: ['catcher_interf'],
  MND: ['mound_visit'],
  TP: ['triple_play', 'grounded_into_triple_play', 'strikeout_triple_play'],
  EJT: ['ejection'],
};

const HIT_TYPES = new Set(['single', 'double', 'triple', 'home_run']);

/**
 * Squares with no reliable signal in the play-by-play feed, left manual-only
 * (per the spec: "not every square will be detectable — that's fine, map
 * what's reliably detectable and leave the rest manual"):
 *   IP HR  — inside-the-park vs. regular HR isn't distinguishable at this
 *            level of detail without hit-trajectory data.
 *   PH/PR  — both surface as the same generic "offensive_substitution",
 *            with no field distinguishing pinch-hit from pinch-run.
 *   OBS    — obstruction has no eventType code at all.
 *   LO     — line outs aren't broken out from "field_out" generically.
 *   OF A   — assists are a boxscore stat, not a play-level event.
 *   FO     — foul outs fall under "field_out" too.
 *   BUNT   — a bunt *single* isn't distinguished from any other single.
 *   BS     — blown save requires save-situation rules beyond one play.
 */
export const UNDETECTABLE = ['IP HR', 'PH', 'PR', 'OBS', 'LO', 'OF A', 'FO', 'BUNT', 'BS'];

/** Abbrs detected via extra logic in detectAbbrs() rather than a plain eventType lookup. */
export const COMPUTED_ABBRS = ['GS', 'RBI', 'VDO', "3 K's", 'NH', 'DLY'];

/**
 * Scans a game's plays so far and returns the set of our event abbreviations
 * that have happened. Combines the direct eventType map above with a few
 * events that need a bit of extra logic beyond a plain lookup. `gameStatus`
 * is the feed's `gameData.status.detailedState`, used only to detect DLY.
 */
export function detectAbbrs(plays: readonly LiveFeedPlay[], gameStatus?: string): Set<string> {
  const found = new Set<string>();

  if (gameStatus && /delay/i.test(gameStatus)) {
    found.add('DLY');
  }

  for (const [abbr, types] of Object.entries(DIRECT_MAP)) {
    if (plays.some((p) => p.result.eventType && types.includes(p.result.eventType))) {
      found.add(abbr);
    }
  }

  // Grand slam: a home run that drove in all 4 possible runs.
  if (plays.some((p) => p.result.eventType === 'home_run' && p.result.rbi === 4)) {
    found.add('GS');
  }

  // RBI hit: any play that drove in a run at all.
  if (plays.some((p) => (p.result.rbi ?? 0) > 0)) {
    found.add('RBI');
  }

  // Video review: the feed flags plays that were reviewed.
  if (plays.some((p) => p.about.hasReview)) {
    found.add('VDO');
  }

  // 3 K's in a row: any 3 consecutive plays (by at-bat order) all strikeouts.
  const inOrder = [...plays].sort((a, b) => a.about.atBatIndex - b.about.atBatIndex);
  const isK = (p: LiveFeedPlay) =>
    p.result.eventType === 'strikeout' || p.result.eventType === 'strike_out';
  for (let i = 0; i + 2 < inOrder.length; i++) {
    if (isK(inOrder[i]) && isK(inOrder[i + 1]) && isK(inOrder[i + 2])) {
      found.add("3 K's");
      break;
    }
  }

  // No-hit bid: a simplification (doesn't track which side) — no hits
  // recorded anywhere in the game once it's into the 7th inning or later.
  const deepInGame = plays.some((p) => p.about.inning >= 7);
  const anyHit = plays.some((p) => p.result.eventType && HIT_TYPES.has(p.result.eventType));
  if (deepInGame && !anyHit) {
    found.add('NH');
  }

  return found;
}
