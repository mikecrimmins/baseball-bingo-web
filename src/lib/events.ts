/**
 * The full event library. 40 events, mixed abbreviation + label format.
 * This list is finalized — do not re-decide. Ported from the Baseball Bingo
 * native app (lib/events.ts); identical there.
 */
export type BingoEvent = {
  abbr: string;
  label: string;
  /** True only for the center FREE space. */
  free?: boolean;
};

export const ALL_EVENTS: BingoEvent[] = [
  { abbr: 'K', label: 'Strikeout' },
  { abbr: 'HR', label: 'Home run' },
  { abbr: 'BB', label: 'Walk' },
  { abbr: '1B', label: 'Single' },
  { abbr: '2B', label: 'Double' },
  { abbr: '3B', label: 'Triple' },
  { abbr: 'DP', label: 'Double play' },
  { abbr: 'SB', label: 'Stolen base' },
  { abbr: 'E', label: 'Error' },
  { abbr: 'WP', label: 'Wild pitch' },
  { abbr: 'PB', label: 'Passed ball' },
  { abbr: 'HBP', label: 'Hit by pitch' },
  { abbr: 'SF', label: 'Sac fly' },
  { abbr: 'SH', label: 'Sac bunt' },
  { abbr: 'CS', label: 'Caught stealing' },
  { abbr: 'FC', label: "Fielder's choice" },
  { abbr: 'IBB', label: "Int'l walk" },
  { abbr: 'BK', label: 'Balk' },
  { abbr: 'PO', label: 'Pickoff' },
  { abbr: 'GS', label: 'Grand slam' },
  { abbr: 'IP HR', label: 'In-park HR' },
  { abbr: 'TP', label: 'Triple play' },
  { abbr: 'EJT', label: 'Ejection' },
  { abbr: 'PH', label: 'Pinch hit' },
  { abbr: 'PR', label: 'Pinch run' },
  { abbr: 'OBS', label: 'Obstruction' },
  { abbr: 'RBI', label: 'RBI hit' },
  { abbr: 'GDP', label: 'Ground into DP' },
  { abbr: 'LO', label: 'Line out' },
  { abbr: 'OF A', label: 'OF assist' },
  { abbr: 'NH', label: 'No-hit bid' },
  { abbr: 'BS', label: 'Blown save' },
  { abbr: 'REL', label: 'Pitching change' },
  { abbr: 'VDO', label: 'Video review' },
  { abbr: 'CI', label: "Catcher's int." },
  { abbr: 'FO', label: 'Foul out' },
  { abbr: "3 K's", label: '3 strikeouts in a row' },
  { abbr: 'MND', label: 'Mound visit' },
  { abbr: 'DLY', label: 'Rain delay' },
  { abbr: 'BUNT', label: 'Bunt single' },
];

/** The center FREE space. Always pre-marked, never tappable. */
export const FREE: BingoEvent = { abbr: 'FREE', label: 'Free space', free: true };
