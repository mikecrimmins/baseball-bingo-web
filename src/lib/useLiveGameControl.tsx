import { useState } from 'react';
import { useLiveGame } from './useLiveGame';
import { GamePicker } from '../components/GamePicker';
import { LiveFeedPanel } from '../components/LiveFeedPanel';

type Args = {
  isHost: boolean;
  mlbGamePk: number | null;
  mlbGameLabel: string | null;
  onFollow: (gamePk: number, label: string) => void;
  onUnfollow: () => void;
};

/**
 * Room-wide live-game section: only the host can attach/detach a game (like
 * starting the game itself), everyone else sees the resulting feed read-only.
 * Returns the live feed state too, so the page can merge detected events
 * into its own confirm-to-mark set.
 */
export function useLiveGameControl({ isHost, mlbGamePk, mlbGameLabel, onFollow, onUnfollow }: Args) {
  const [picking, setPicking] = useState(false);
  const feed = useLiveGame(mlbGamePk);

  const element =
    mlbGamePk && mlbGameLabel ? (
      <LiveFeedPanel label={mlbGameLabel} feed={feed} onDetach={isHost ? onUnfollow : undefined} />
    ) : isHost ? (
      picking ? (
        <GamePicker
          onPick={(gamePk, label) => {
            onFollow(gamePk, label);
            setPicking(false);
          }}
          onCancel={() => setPicking(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="w-full rounded-xl border-2 border-dashed border-navy-light/30 px-4 py-3 text-sm font-semibold text-navy-dark/60 transition-colors hover:bg-navy/5"
        >
          Follow a live game
        </button>
      )
    ) : (
      <p className="text-center text-xs text-navy-dark/50">
        The host hasn't attached a live game yet.
      </p>
    );

  return { element, feed };
}
