import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import type { CardSize } from '../lib/types';

const OPTIONS: { size: CardSize; title: string; blurb: string }[] = [
  { size: 3, title: 'Quick game', blurb: '3×3 — 8 events, first line wins. Good for a tight inning.' },
  { size: 5, title: 'Full game', blurb: '5×5 — 24 events, classic bingo, blackout optional.' },
];

export function Landing() {
  const navigate = useNavigate();
  const newCard = useGameStore((s) => s.newCard);

  function start(size: CardSize) {
    newCard(size);
    navigate('/play');
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-10 px-4 py-16 text-center">
      <div>
        <p className="font-display text-5xl font-bold tracking-wide text-navy sm:text-6xl">
          ⚾ Baseball Bingo
        </p>
        <p className="mt-3 text-base text-navy-dark/70 sm:text-lg">
          Mark the plays as they happen. Watch the game, play along.
        </p>
      </div>

      <div className="grid w-full gap-4 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.size}
            type="button"
            onClick={() => start(opt.size)}
            className="flex flex-col items-start gap-2 rounded-2xl border-2 border-navy-light/25 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-md"
          >
            <span className="font-display text-2xl font-semibold text-navy">{opt.title}</span>
            <span className="text-sm text-navy-dark/70">{opt.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
