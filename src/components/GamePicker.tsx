import { useEffect, useState } from 'react';
import { fetchSchedule, todayForSchedule, type ScheduleGame } from '../lib/mlbApi';

type Props = {
  onPick: (gamePk: number, label: string) => void;
  onCancel: () => void;
};

function label(g: ScheduleGame): string {
  return `${g.teams.away.team.name} @ ${g.teams.home.team.name}`;
}

/** Today's MLB schedule, for attaching a live feed to a game. */
export function GamePicker({ onPick, onCancel }: Props) {
  const [games, setGames] = useState<ScheduleGame[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSchedule(todayForSchedule())
      .then((g) => !cancelled && setGames(g))
      .catch(() => !cancelled && setError("Couldn't load today's schedule."));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-navy-light/20 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-navy-dark/60 uppercase">
          Today's games
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-navy-dark/50 hover:underline"
        >
          Cancel
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {!games && !error && <p className="text-sm text-navy-dark/60">Loading…</p>}
      {games && games.length === 0 && (
        <p className="text-sm text-navy-dark/60">No games scheduled today.</p>
      )}

      <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
        {games?.map((g) => (
          <li key={g.gamePk}>
            <button
              type="button"
              onClick={() => onPick(g.gamePk, label(g))}
              className="flex w-full flex-col items-start gap-0.5 rounded-lg border-2 border-navy-light/20 px-3 py-2 text-left transition-colors hover:bg-navy/5"
            >
              <span className="text-sm font-medium text-navy-dark">{label(g)}</span>
              <span className="text-xs text-navy-dark/50">{g.status.detailedState}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
