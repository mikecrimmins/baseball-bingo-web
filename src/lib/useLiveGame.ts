import { useEffect, useRef, useState } from 'react';
import { fetchLiveFeed, type LiveFeed } from './mlbApi';
import { detectAbbrs } from './mlbEventMapping';

const POLL_MS = 15_000;

export type LiveGameState = {
  loading: boolean;
  /** True once we've had at least one successful fetch this game. */
  available: boolean;
  awayName: string | null;
  homeName: string | null;
  awayScore: number | null;
  homeScore: number | null;
  inning: number | null;
  inningState: string | null;
  statusText: string | null;
  isFinal: boolean;
  /** Most recent plays first, a handful of descriptions for the feed panel. */
  recentPlays: string[];
  /** Our event abbreviations detected so far in this game. */
  detectedAbbrs: Set<string>;
};

const EMPTY: LiveGameState = {
  loading: false,
  available: false,
  awayName: null,
  homeName: null,
  awayScore: null,
  homeScore: null,
  inning: null,
  inningState: null,
  statusText: null,
  isFinal: false,
  recentPlays: [],
  detectedAbbrs: new Set(),
};

function toState(feed: LiveFeed): LiveGameState {
  const plays = feed.liveData.plays.allPlays;
  const line = feed.liveData.linescore;
  const status = feed.gameData.status;
  const recentPlays = [...plays]
    .filter((p) => p.result.description)
    .sort((a, b) => b.about.atBatIndex - a.about.atBatIndex)
    .slice(0, 5)
    .map((p) => p.result.description as string);

  return {
    loading: false,
    available: true,
    awayName: feed.gameData.teams.away.name,
    homeName: feed.gameData.teams.home.name,
    awayScore: line?.teams?.away?.runs ?? null,
    homeScore: line?.teams?.home?.runs ?? null,
    inning: line?.currentInning ?? null,
    inningState: line?.inningState ?? null,
    statusText: status.detailedState,
    isFinal: status.abstractGameState === 'Final',
    recentPlays,
    detectedAbbrs: detectAbbrs(plays, status.detailedState),
  };
}

/**
 * Polls a game's live feed politely (every 15s) and degrades gracefully: a
 * failed fetch just keeps the last known-good state rather than throwing, so
 * the card stays fully manually-playable regardless of the API's mood.
 */
export function useLiveGame(gamePk: number | null): LiveGameState {
  const [state, setState] = useState<LiveGameState>(EMPTY);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    if (!gamePk) {
      setState(EMPTY);
      return;
    }

    setState((s) => ({ ...s, loading: !s.available }));
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const feed = await fetchLiveFeed(gamePk as number);
        if (stoppedRef.current) return;
        const next = toState(feed);
        setState(next);
        if (!next.isFinal) {
          timer = setTimeout(poll, POLL_MS);
        }
      } catch {
        if (stoppedRef.current) return;
        // Keep whatever we had; just try again later.
        setState((s) => ({ ...s, loading: false }));
        timer = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => {
      stoppedRef.current = true;
      if (timer) clearTimeout(timer);
    };
  }, [gamePk]);

  return state;
}
