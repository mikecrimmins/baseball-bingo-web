import type { LiveGameState } from '../lib/useLiveGame';

type Props = {
  label: string;
  feed: LiveGameState;
  /** Omit for read-only viewers (non-hosts in a room) — hides the control. */
  onDetach?: () => void;
};

/** Sidebar panel showing score/inning/recent plays for an attached live game. */
export function LiveFeedPanel({ label, feed, onDetach }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded border-[1.5px] border-navy bg-paper-bright p-4">
      <div className="flex items-center justify-between">
        <span className="font-varsity text-xs tracking-[0.12em] text-ink-muted uppercase">
          Live feed
        </span>
        {onDetach && (
          <button
            type="button"
            onClick={onDetach}
            className="text-xs font-semibold text-ink-faint hover:underline"
          >
            Stop following
          </button>
        )}
      </div>

      <p className="text-sm font-semibold text-navy">{label}</p>

      {!feed.available ? (
        <p className="text-sm text-ink-muted">
          {feed.loading ? 'Connecting…' : "Feed's unavailable right now — mark manually for now."}
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-[3px] bg-paper px-3 py-2">
            <span className="text-lg font-semibold text-navy">
              {feed.awayScore ?? 0}–{feed.homeScore ?? 0}
            </span>
            <span className="text-xs text-ink-muted">
              {feed.isFinal
                ? 'Final'
                : feed.inning
                  ? `${feed.inningState ?? ''} ${feed.inning}`.trim()
                  : feed.statusText}
            </span>
          </div>

          {feed.recentPlays.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {feed.recentPlays.map((play, i) => (
                <li key={i} className="text-xs text-ink-muted">
                  {play}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
