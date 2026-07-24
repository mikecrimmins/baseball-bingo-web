import { useState } from 'react';
import type { BingoEvent } from '../lib/events';
import type { CardSize } from '../lib/types';
import { BingoCell } from './BingoCell';

type Props = {
  size: CardSize;
  card: BingoEvent[];
  marked: boolean[];
  winning: Set<number>;
  /** Multiplayer only: cells whose event has been called but isn't marked yet. */
  called?: Set<number>;
  onToggle: (index: number) => void;
};

export function BingoCard({ size, card, marked, winning, called, onToggle }: Props) {
  const [infoEvent, setInfoEvent] = useState<BingoEvent | null>(null);

  return (
    <>
      <div
        className="mx-auto grid w-full max-w-xl gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {card.map((event, i) => (
          <BingoCell
            key={i}
            event={event}
            marked={marked[i]}
            winning={winning.has(i)}
            called={called?.has(i)}
            onToggle={() => onToggle(i)}
            onInfo={() => setInfoEvent((prev) => (prev?.abbr === event.abbr ? null : event))}
          />
        ))}
      </div>

      {infoEvent && (
        <div className="animate-sheet-up fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4">
          <div className="ticket-shadow flex w-full max-w-sm items-start gap-3 rounded border-[1.5px] border-navy bg-paper-bright p-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy">
                {infoEvent.abbr} <span className="font-normal text-ink-muted">— {infoEvent.label}</span>
              </p>
              <p className="mt-1 text-sm text-ink-muted">{infoEvent.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setInfoEvent(null)}
              aria-label="Close"
              className="font-varsity shrink-0 rounded-[3px] px-2 py-1 text-xs text-ink-faint uppercase hover:bg-paper-edge/40 active:bg-paper-edge/60"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
