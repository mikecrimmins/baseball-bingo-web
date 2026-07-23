import { useEffect, useRef, useState } from 'react';
import type { BingoEvent } from '../lib/events';

type Props = {
  event: BingoEvent;
  marked: boolean;
  winning: boolean;
  /** Multiplayer only: the caller has called this event but it isn't marked yet. */
  called?: boolean;
  onToggle: () => void;
};

export function BingoCell({ event, marked, winning, called, onToggle }: Props) {
  const [popping, setPopping] = useState(false);
  const prevMarked = useRef(marked);

  useEffect(() => {
    if (marked && !prevMarked.current) {
      setPopping(true);
      const t = setTimeout(() => setPopping(false), 260);
      prevMarked.current = marked;
      return () => clearTimeout(t);
    }
    prevMarked.current = marked;
  }, [marked]);

  if (event.free) {
    return (
      <div
        className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-gold bg-gold/20 text-navy-dark select-none"
        aria-label="Free space"
      >
        <span className="font-condensed text-lg font-semibold sm:text-2xl">★</span>
        <span className="text-[9px] font-semibold tracking-wide uppercase opacity-70 sm:text-xs">
          Free
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={marked}
      className={[
        'relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-0.5 text-center select-none',
        'transition-colors duration-150 active:scale-95',
        popping ? 'animate-cell-pop' : '',
        winning
          ? 'border-gold-bright bg-gold text-navy-dark ring-4 ring-gold-bright/40'
          : marked
            ? 'border-navy bg-navy text-white'
            : called
              ? 'animate-pulse-called border-gold-bright bg-gold/25 text-navy-dark ring-4 ring-gold-bright/50'
              : 'border-navy-light/25 bg-white text-navy-dark hover:bg-navy/5',
      ].join(' ')}
    >
      <span className="font-condensed text-sm leading-tight font-semibold sm:text-xl">
        {event.abbr}
      </span>
      <span className="hidden text-[9px] leading-tight tracking-wide uppercase opacity-70 sm:block sm:text-[11px]">
        {event.label}
      </span>
      {called && !marked && (
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-gold-bright px-1 text-[8px] font-bold text-navy-dark shadow sm:text-[9px]">
          MARK?
        </span>
      )}
    </button>
  );
}
