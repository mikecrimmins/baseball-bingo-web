import { useEffect, useRef, useState } from 'react';
import type { BingoEvent } from '../lib/events';
import { Logo } from './Logo';

type Props = {
  event: BingoEvent;
  marked: boolean;
  winning: boolean;
  /** Multiplayer only: the caller has called this event but it isn't marked yet. */
  called?: boolean;
  onToggle: () => void;
  /** Reveal this cell's plain-English definition (see BingoCard's info sheet). */
  onInfo: () => void;
};

export function BingoCell({ event, marked, winning, called, onToggle, onInfo }: Props) {
  const [stamping, setStamping] = useState(false);
  const prevMarked = useRef(marked);

  useEffect(() => {
    if (marked && !prevMarked.current) {
      setStamping(true);
      const t = setTimeout(() => setStamping(false), 220);
      prevMarked.current = marked;
      return () => clearTimeout(t);
    }
    prevMarked.current = marked;
  }, [marked]);

  if (event.free) {
    return (
      <div
        className="flex aspect-square flex-col items-center justify-center rounded border-2 border-navy bg-paper-bright select-none"
        aria-label="Free space"
      >
        <Logo size={26} className="sm:hidden" />
        <Logo size={38} className="hidden sm:block" />
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-pressed={marked}
      aria-label={`${event.abbr} — ${event.label}`}
      className={[
        'relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded border-2 bg-paper-bright px-0.5 text-center select-none',
        'transition-colors duration-150 active:scale-95',
        winning
          ? 'border-stitch-red'
          : called
            ? 'animate-pulse-called border-dashed border-stitch-red'
            : 'border-navy hover:bg-paper-edge/20',
      ].join(' ')}
    >
      <span className="text-sm leading-tight font-medium text-navy sm:text-xl">{event.abbr}</span>
      <span className="hidden text-[9px] leading-tight tracking-wide text-ink-muted uppercase sm:block sm:text-[11px]">
        {event.label}
      </span>

      {marked && (
        <span
          aria-hidden="true"
          className={[
            'pointer-events-none absolute inset-[10%] rounded-full border-[3px] border-stitch-red',
            stamping ? 'animate-stamp-down' : '',
          ].join(' ')}
          style={{ '--stamp-rotate': '-7deg', transform: 'rotate(-7deg)' } as React.CSSProperties}
        />
      )}

      {called && !marked && (
        <span className="font-varsity absolute -top-1.5 -right-1.5 rounded-[3px] bg-stitch-red px-1 text-[8px] tracking-wide text-paper-bright uppercase">
          Mark?
        </span>
      )}

      {event.description && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInfo();
          }}
          aria-label={`What does ${event.abbr} mean?`}
          className="font-varsity absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-navy bg-paper-bright text-[9px] leading-none text-ink-muted hover:bg-paper-edge/40 active:bg-paper-edge/60"
        >
          ?
        </button>
      )}
    </div>
  );
}
