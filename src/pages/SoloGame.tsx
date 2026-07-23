import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useBingoGame } from '../lib/useBingoGame';
import { useLiveGame } from '../lib/useLiveGame';
import { BingoCard } from '../components/BingoCard';
import { WinBanner } from '../components/WinBanner';
import { GameLayout } from '../components/GameLayout';
import { GamePicker } from '../components/GamePicker';
import { LiveFeedPanel } from '../components/LiveFeedPanel';
import { Logo } from '../components/Logo';

export function SoloGame() {
  const navigate = useNavigate();
  const size = useGameStore((s) => s.size);
  const card = useGameStore((s) => s.card);
  const marked = useGameStore((s) => s.marked);
  const toggleCell = useGameStore((s) => s.toggleCell);
  const newCard = useGameStore((s) => s.newCard);
  const liveGamePk = useGameStore((s) => s.liveGamePk);
  const liveGameLabel = useGameStore((s) => s.liveGameLabel);
  const followGame = useGameStore((s) => s.followGame);
  const unfollowGame = useGameStore((s) => s.unfollowGame);

  const [keepGoing, setKeepGoing] = useState(false);
  const [pickingGame, setPickingGame] = useState(false);

  // Reset the "keep playing" dismissal whenever a fresh card is drawn.
  useEffect(() => {
    setKeepGoing(false);
  }, [card]);

  const derived = useBingoGame(marked, size ?? 5);
  const feed = useLiveGame(liveGamePk);

  const detectedPending = useMemo(() => {
    const pending = new Set<number>();
    card.forEach((event, i) => {
      if (!event.free && feed.detectedAbbrs.has(event.abbr) && !marked[i]) pending.add(i);
    });
    return pending;
  }, [card, feed.detectedAbbrs, marked]);

  if (!size || card.length === 0) {
    return <Navigate to="/" replace />;
  }

  const canKeepGoing = size === 5 && derived.winState === 'bingo';
  const showBanner = derived.winState === 'blackout' || (derived.winState === 'bingo' && !keepGoing);
  const total = size * size - 1;

  return (
    <>
      <GameLayout
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Logo size={44} />
              <div>
                <p className="font-vintage text-2xl text-navy sm:text-3xl">Baseball Bingo</p>
                <p className="text-sm text-navy-dark/60">
                  {size}×{size} · {derived.count}/{total} marked
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => newCard(size)}
                className="rounded-lg border-2 border-navy-light/30 px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
              >
                New card
              </button>
              <Link
                to="/glossary"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-dark/60 transition-colors hover:bg-navy/5"
              >
                Glossary
              </Link>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-dark/60 transition-colors hover:bg-navy/5"
              >
                Change size
              </button>
            </div>
          </div>
        }
        main={
          <BingoCard
            size={size}
            card={card}
            marked={marked}
            winning={derived.winning}
            called={detectedPending}
            onToggle={toggleCell}
          />
        }
        sidebar={
          liveGamePk && liveGameLabel ? (
            <LiveFeedPanel label={liveGameLabel} feed={feed} onDetach={unfollowGame} />
          ) : pickingGame ? (
            <GamePicker
              onPick={(gamePk, label) => {
                followGame(gamePk, label);
                setPickingGame(false);
              }}
              onCancel={() => setPickingGame(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setPickingGame(true)}
              className="w-full rounded-xl border-2 border-dashed border-navy-light/30 px-4 py-3 text-sm font-semibold text-navy-dark/60 transition-colors hover:bg-navy/5"
            >
              Follow a live game
            </button>
          )
        }
      />
      {showBanner && (
        <WinBanner
          winState={derived.winState === 'blackout' ? 'blackout' : 'bingo'}
          canKeepGoing={canKeepGoing}
          onPlayAgain={() => newCard(size)}
          onKeepGoing={() => setKeepGoing(true)}
        />
      )}
    </>
  );
}
