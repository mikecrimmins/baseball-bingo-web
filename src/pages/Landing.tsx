import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Logo } from '../components/Logo';
import { StitchDivider } from '../components/StitchDivider';
import { Ticket } from '../components/Ticket';
import type { CardSize } from '../lib/types';

const OPTIONS: { size: CardSize; eyebrow: string; title: string; meta: string; tilt: -1 | 1 }[] = [
  {
    size: 3,
    eyebrow: 'Quick game',
    title: 'General admission',
    meta: '3×3 · 8 events · first line wins',
    tilt: -1,
  },
  {
    size: 5,
    eyebrow: 'Full game',
    title: 'Season ticket',
    meta: '5×5 · 24 events · blackout optional',
    tilt: 1,
  },
];

export function Landing() {
  const navigate = useNavigate();
  const newCard = useGameStore((s) => s.newCard);

  function start(size: CardSize) {
    newCard(size);
    navigate('/play');
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo size={48} />
          <p className="headline text-4xl tracking-wide text-navy sm:text-5xl">
            Baseball Bingo
          </p>
        </div>
        <p className="text-base text-ink-muted sm:text-lg">
          Watch the game. Mark the plays as they happen. Play along.
        </p>
      </div>

      <StitchDivider />

      <div className="flex flex-col gap-3">
        <span className="font-varsity text-xs tracking-[0.15em] text-red-deep uppercase">
          Pick your ticket
        </span>
        <div className="grid gap-5 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <Ticket
              key={opt.size}
              tilt={opt.tilt}
              interactive
              stubLabel="Admit one"
              onClick={() => start(opt.size)}
            >
              <span className="font-varsity text-xs tracking-[0.12em] text-stitch-red uppercase">
                {opt.eyebrow}
              </span>
              <p className="headline mt-1 text-2xl text-navy">{opt.title}</p>
              <p className="mt-1.5 text-sm text-ink-muted">{opt.meta}</p>
            </Ticket>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/host')}
          className="font-varsity rounded-[3px] bg-navy px-5 py-3.5 text-xs tracking-[0.12em] text-paper-bright uppercase transition-colors hover:bg-navy/90"
        >
          Play ball — host a game
        </button>
        <button
          type="button"
          onClick={() => navigate('/join')}
          className="font-varsity rounded-[3px] border-2 border-dashed border-stitch-red px-5 py-3.5 text-xs tracking-[0.12em] text-stitch-red uppercase transition-colors hover:bg-stitch-red/5"
        >
          Join a game
        </button>
      </div>

      <Link
        to="/glossary"
        className="text-right text-sm text-ink-faint underline decoration-dotted underline-offset-4 hover:text-navy"
      >
        What do all these abbreviations mean?
      </Link>
    </div>
  );
}
