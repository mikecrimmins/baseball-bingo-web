import { describe, it, expect } from 'vitest';
import { ALL_EVENTS } from '../events';
import { detectAbbrs, DIRECT_MAP, COMPUTED_ABBRS, UNDETECTABLE } from '../mlbEventMapping';
import type { LiveFeedPlay } from '../mlbApi';

type PlayOptions = {
  eventType?: string;
  rbi?: number;
  inning?: number;
  atBatIndex?: number;
  hasReview?: boolean;
};

function play(opts: PlayOptions): LiveFeedPlay {
  return {
    result: { eventType: opts.eventType, rbi: opts.rbi ?? 0, description: '' },
    about: {
      inning: opts.inning ?? 1,
      atBatIndex: opts.atBatIndex ?? 0,
      isTopInning: true,
      isComplete: true,
      hasReview: opts.hasReview,
    },
  };
}

describe('every event has exactly one mapping strategy', () => {
  const directAbbrs = Object.keys(DIRECT_MAP);
  const allMapped = [...directAbbrs, ...COMPUTED_ABBRS, ...UNDETECTABLE];

  it('accounts for all 40 library events, none missing, none duplicated', () => {
    const libraryAbbrs = ALL_EVENTS.map((e) => e.abbr).sort();
    expect(allMapped.length).toBe(ALL_EVENTS.length);
    expect([...allMapped].sort()).toEqual(libraryAbbrs);
  });

  it('has no abbr claimed by more than one strategy', () => {
    const seen = new Set<string>();
    for (const abbr of allMapped) {
      expect(seen.has(abbr)).toBe(false);
      seen.add(abbr);
    }
  });
});

describe('detectAbbrs — direct eventType matches', () => {
  it('detects a single', () => {
    expect(detectAbbrs([play({ eventType: 'single', atBatIndex: 0 })]).has('1B')).toBe(true);
  });

  it('detects a strikeout', () => {
    expect(detectAbbrs([play({ eventType: 'strikeout', atBatIndex: 0 })]).has('K')).toBe(true);
  });

  it('detects a mound visit', () => {
    expect(detectAbbrs([play({ eventType: 'mound_visit', atBatIndex: 0 })]).has('MND')).toBe(true);
  });

  it('detects a pitching substitution as REL', () => {
    expect(detectAbbrs([play({ eventType: 'pitching_substitution', atBatIndex: 0 })]).has('REL')).toBe(true);
  });

  it('does not detect anything from an unrelated play', () => {
    const found = detectAbbrs([play({ eventType: 'field_out', atBatIndex: 0, rbi: 0 })]);
    expect(found.has('1B')).toBe(false);
    expect(found.has('K')).toBe(false);
  });
});

describe('detectAbbrs — computed cases', () => {
  it('flags a grand slam only when rbi is exactly 4', () => {
    const slam = detectAbbrs([play({ eventType: 'home_run', rbi: 4, atBatIndex: 0 })]);
    expect(slam.has('GS')).toBe(true);
    expect(slam.has('HR')).toBe(true); // still a home run too

    const soloShot = detectAbbrs([play({ eventType: 'home_run', rbi: 1, atBatIndex: 0 })]);
    expect(soloShot.has('GS')).toBe(false);
    expect(soloShot.has('HR')).toBe(true);
  });

  it('flags RBI on any play that drove in a run, regardless of event type', () => {
    expect(detectAbbrs([play({ eventType: 'sac_fly', rbi: 1, atBatIndex: 0 })]).has('RBI')).toBe(true);
    expect(detectAbbrs([play({ eventType: 'field_out', rbi: 0, atBatIndex: 0 })]).has('RBI')).toBe(false);
  });

  it('flags video review only when the play was actually reviewed', () => {
    expect(detectAbbrs([play({ eventType: 'field_out', hasReview: true, atBatIndex: 0 })]).has('VDO')).toBe(true);
    expect(detectAbbrs([play({ eventType: 'field_out', hasReview: false, atBatIndex: 0 })]).has('VDO')).toBe(false);
  });

  it('flags rain delay from the game status text, independent of plays', () => {
    expect(detectAbbrs([], 'In Progress').has('DLY')).toBe(false);
    expect(detectAbbrs([], 'Delayed: Rain').has('DLY')).toBe(true);
  });

  it("flags 3 K's only on 3 consecutive strikeouts, order-independent of input array order", () => {
    const threeInARow = [
      play({ eventType: 'strikeout', atBatIndex: 5 }),
      play({ eventType: 'field_out', atBatIndex: 4 }),
      play({ eventType: 'strikeout', atBatIndex: 6 }),
      play({ eventType: 'strikeout', atBatIndex: 7 }),
    ];
    expect(detectAbbrs(threeInARow).has("3 K's")).toBe(true);

    const interrupted = [
      play({ eventType: 'strikeout', atBatIndex: 0 }),
      play({ eventType: 'field_out', atBatIndex: 1 }),
      play({ eventType: 'strikeout', atBatIndex: 2 }),
    ];
    expect(detectAbbrs(interrupted).has("3 K's")).toBe(false);
  });

  it('flags a no-hit bid once deep in the game with zero hits, not before', () => {
    const earlyNoHitter = [play({ eventType: 'strikeout', inning: 3, atBatIndex: 0 })];
    expect(detectAbbrs(earlyNoHitter).has('NH')).toBe(false);

    const lateNoHitter = [play({ eventType: 'strikeout', inning: 7, atBatIndex: 0 })];
    expect(detectAbbrs(lateNoHitter).has('NH')).toBe(true);

    const lateWithAHit = [
      play({ eventType: 'single', inning: 2, atBatIndex: 0 }),
      play({ eventType: 'strikeout', inning: 7, atBatIndex: 1 }),
    ];
    expect(detectAbbrs(lateWithAHit).has('NH')).toBe(false);
  });
});
