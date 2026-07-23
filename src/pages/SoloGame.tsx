import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useBingoGame } from '../lib/useBingoGame';
import { BingoCard } from '../components/BingoCard';
import { WinBanner } from '../components/WinBanner';
import { GameLayout } from '../components/GameLayout';
import { Logo } from '../components/Logo';

export function SoloGame() {
  const navigate = useNavigate();
  const size = useGameStore((s) => s.size);
  const card = useGameStore((s) => s.card);
  const marked = useGameStore((s) => s.marked);
  const toggleCell = useGameStore((s) => s.toggleCell);
  const newCard = useGameStore((s) => s.newCard);

  const [keepGoing, setKeepGoing] = useState(false);

  // Reset the "keep playing" dismissal whenever a fresh card is drawn.
  useEffect(() => {
    setKeepGoing(false);
  }, [card]);

  const derived = useBingoGame(marked, size ?? 5);

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
                <p className="font-display text-2xl font-bold text-navy sm:text-3xl">Baseball Bingo</p>
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
          <BingoCard size={size} card={card} marked={marked} winning={derived.winning} onToggle={toggleCell} />
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
