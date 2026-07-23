/**
 * The full event library. 40 events, mixed abbreviation + label format.
 * This list is finalized — do not re-decide. Ported from the Baseball Bingo
 * native app (lib/events.ts); identical there. `description` is web-only,
 * added for the glossary page.
 */
export type BingoEvent = {
  abbr: string;
  label: string;
  /** Plain-English explanation, shown on the glossary page. */
  description?: string;
  /** True only for the center FREE space. */
  free?: boolean;
};

export const ALL_EVENTS: BingoEvent[] = [
  { abbr: 'K', label: 'Strikeout', description: 'The batter is out after three strikes.' },
  {
    abbr: 'HR',
    label: 'Home run',
    description: 'The batter circles all the bases and scores on their own hit.',
  },
  {
    abbr: 'BB',
    label: 'Walk',
    description: 'The batter takes four pitches outside the strike zone and gets first base free.',
  },
  { abbr: '1B', label: 'Single', description: 'The batter hits safely and reaches first base.' },
  { abbr: '2B', label: 'Double', description: 'The batter hits safely and reaches second base.' },
  { abbr: '3B', label: 'Triple', description: 'The batter hits safely and reaches third base.' },
  { abbr: 'DP', label: 'Double play', description: 'The defense records two outs on a single play.' },
  {
    abbr: 'SB',
    label: 'Stolen base',
    description: 'A runner advances a base during the pitch, without a hit or walk.',
  },
  {
    abbr: 'E',
    label: 'Error',
    description: 'A fielder misplays a ball they should have handled, letting a runner advance.',
  },
  {
    abbr: 'WP',
    label: 'Wild pitch',
    description: "A pitch gets past the catcher, letting a runner advance on the pitcher's miss.",
  },
  {
    abbr: 'PB',
    label: 'Passed ball',
    description: "The catcher misses a catchable pitch, letting a runner advance on the catcher's miss.",
  },
  {
    abbr: 'HBP',
    label: 'Hit by pitch',
    description: 'The batter is struck by a pitch and awarded first base.',
  },
  {
    abbr: 'SF',
    label: 'Sac fly',
    description: 'A fly ball is caught for an out, but deep enough for a runner to score after the catch.',
  },
  {
    abbr: 'SH',
    label: 'Sac bunt',
    description: 'The batter bunts to advance a runner, accepting being thrown out at first.',
  },
  {
    abbr: 'CS',
    label: 'Caught stealing',
    description: 'A runner attempting to steal a base is thrown out.',
  },
  {
    abbr: 'FC',
    label: "Fielder's choice",
    description: 'A fielder gets a runner out at another base instead of throwing out the batter.',
  },
  {
    abbr: 'IBB',
    label: "Int'l walk",
    description: 'The pitcher deliberately throws four balls to avoid pitching to the batter.',
  },
  {
    abbr: 'BK',
    label: 'Balk',
    description: "An illegal move by the pitcher with runners on base — every runner moves up one base.",
  },
  {
    abbr: 'PO',
    label: 'Pickoff',
    description: 'A runner is thrown out trying to get back to their base.',
  },
  {
    abbr: 'GS',
    label: 'Grand slam',
    description: 'A home run hit with the bases loaded, scoring four runs at once.',
  },
  {
    abbr: 'IP HR',
    label: 'In-park HR',
    description: "A home run where the ball stays in play and the batter circles the bases before being tagged out.",
  },
  { abbr: 'TP', label: 'Triple play', description: 'The defense records three outs on a single play.' },
  {
    abbr: 'EJT',
    label: 'Ejection',
    description: 'A player, coach, or manager is thrown out of the game by an umpire.',
  },
  {
    abbr: 'PH',
    label: 'Pinch hit',
    description: 'A substitute batter hits in place of the player due up.',
  },
  {
    abbr: 'PR',
    label: 'Pinch run',
    description: 'A substitute runner takes over for a runner already on base.',
  },
  {
    abbr: 'OBS',
    label: 'Obstruction',
    description: "A fielder illegally blocks a runner's path without the ball.",
  },
  { abbr: 'RBI', label: 'RBI hit', description: 'A hit that drives in a run.' },
  {
    abbr: 'GDP',
    label: 'Ground into DP',
    description: 'The batter grounds out and a runner is forced out on the same play.',
  },
  { abbr: 'LO', label: 'Line out', description: 'A hard-hit line drive is caught in the air for an out.' },
  {
    abbr: 'OF A',
    label: 'OF assist',
    description: 'An outfielder throws a runner out on the bases.',
  },
  {
    abbr: 'NH',
    label: 'No-hit bid',
    description: 'A pitcher is deep into a game without allowing a hit.',
  },
  {
    abbr: 'BS',
    label: 'Blown save',
    description: 'A reliever brought in to protect a lead gives it up instead.',
  },
  { abbr: 'REL', label: 'Pitching change', description: 'A new pitcher enters the game.' },
  {
    abbr: 'VDO',
    label: 'Video review',
    description: "The umpires review a call using instant replay.",
  },
  {
    abbr: 'CI',
    label: "Catcher's int.",
    description: "The catcher illegally interferes with the batter's swing.",
  },
  {
    abbr: 'FO',
    label: 'Foul out',
    description: 'The batter is put out on a foul ball caught by a fielder.',
  },
  {
    abbr: "3 K's",
    label: '3 strikeouts in a row',
    description: 'A pitcher strikes out three batters in a row.',
  },
  {
    abbr: 'MND',
    label: 'Mound visit',
    description: 'A coach, manager, or catcher visits the pitcher on the mound.',
  },
  { abbr: 'DLY', label: 'Rain delay', description: 'The game is paused, usually for weather.' },
  {
    abbr: 'BUNT',
    label: 'Bunt single',
    description: 'The batter reaches base safely on a bunt.',
  },
];

/** The center FREE space. Always pre-marked, never tappable. */
export const FREE: BingoEvent = { abbr: 'FREE', label: 'Free space', free: true };
