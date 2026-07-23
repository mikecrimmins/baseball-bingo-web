import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Logo } from '../components/Logo';
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
        <div className="flex items-center justify-center gap-3">
          <Logo size={56} className="sm:hidden" />
          <Logo size={72} className="hidden sm:block" />
          <p className="font-vintage text-5xl tracking-wide text-navy sm:text-6xl">
            Baseball Bingo
          </p>
        </div>
        <p className="mt-3 text-base text-navy-dark/70 sm:text-lg">
          Mark the plays as they happen. Watch the game, play along.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <span className="text-xs font-semibold tracking-wide text-navy-dark/50 uppercase">
          Solo
        </span>
        <div className="grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.size}
              type="button"
              onClick={() => start(opt.size)}
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-navy-light/25 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-md"
            >
              <span className="font-vintage text-2xl text-navy">{opt.title}</span>
              <span className="text-sm text-navy-dark/70">{opt.blurb}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <span className="text-xs font-semibold tracking-wide text-navy-dark/50 uppercase">
          With friends
        </span>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/host')}
            className="rounded-xl border-2 border-navy bg-navy px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            Host a game
          </button>
          <button
            type="button"
            onClick={() => navigate('/join')}
            className="rounded-xl border-2 border-navy px-5 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
          >
            Join a game
          </button>
        </div>
      </div>
    </div>
  );
}
