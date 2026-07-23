/**
 * Thin client over the free, unauthenticated MLB Stats API
 * (https://statsapi.mlb.com). No API key — but MLB's terms limit this to
 * individual, non-commercial, non-bulk use (see
 * http://gdx.mlb.com/components/copyright.txt), which is what this app is.
 *
 * Shapes here are trimmed to the fields we actually use, verified against
 * live responses rather than assumed. The full canonical eventType catalog
 * (used by mlbEventMapping.ts) comes from the API's own metadata endpoint:
 * https://statsapi.mlb.com/api/v1/eventTypes
 */

const BASE = 'https://statsapi.mlb.com/api';

export type ScheduleGame = {
  gamePk: number;
  gameDate: string;
  status: { abstractGameState: string; detailedState: string };
  teams: {
    away: { team: { id: number; name: string } };
    home: { team: { id: number; name: string } };
  };
};

export async function fetchSchedule(date: string): Promise<ScheduleGame[]> {
  const res = await fetch(`${BASE}/v1/schedule?sportId=1&date=${date}`);
  if (!res.ok) throw new Error(`Schedule request failed (${res.status})`);
  const data = await res.json();
  return data.dates?.[0]?.games ?? [];
}

export type LiveFeedPlay = {
  result: {
    event?: string;
    eventType?: string;
    description?: string;
    rbi?: number;
  };
  about: {
    atBatIndex: number;
    inning: number;
    isTopInning: boolean;
    isComplete: boolean;
    isScoringPlay?: boolean;
    hasReview?: boolean;
  };
};

export type LiveFeed = {
  gameData: {
    status: { abstractGameState: string; detailedState: string };
    teams: { away: { name: string }; home: { name: string } };
  };
  liveData: {
    plays: { allPlays: LiveFeedPlay[] };
    linescore?: {
      currentInning?: number;
      inningState?: string;
      teams?: { home?: { runs?: number }; away?: { runs?: number } };
    };
  };
};

export async function fetchLiveFeed(gamePk: number): Promise<LiveFeed> {
  const res = await fetch(`${BASE}/v1.1/game/${gamePk}/feed/live`);
  if (!res.ok) throw new Error(`Live feed request failed (${res.status})`);
  return res.json();
}

/** Today's date in the API's expected YYYY-MM-DD, in the browser's local time zone. */
export function todayForSchedule(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
