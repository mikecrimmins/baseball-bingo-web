import { closestLineNeed } from '../lib/bingoDetect';
import type { CardSize, PlayerState } from '../lib/types';

type Props = {
  players: PlayerState[];
  meId: string;
  hostId: string;
  size: CardSize;
};

export function RosterPanel({ players, meId, hostId, size }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-navy-light/20 bg-white p-4">
      <span className="text-xs font-semibold tracking-wide text-navy-dark/60 uppercase">
        Players
      </span>
      <ul className="flex flex-col gap-1.5">
        {players.map((p) => {
          const status = p.hasBlackout
            ? 'Blackout!'
            : p.hasBingo
              ? 'Bingo!'
              : `needs ${closestLineNeed(p.marked, size)}`;
          const won = p.hasBingo || p.hasBlackout;
          return (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <span className={p.id === meId ? 'font-semibold text-navy' : 'text-navy-dark'}>
                {p.name}
                {p.id === meId && ' (you)'}
                {p.id === hostId && (
                  <span className="ml-1.5 text-[10px] tracking-wide text-navy-dark/40 uppercase">
                    host
                  </span>
                )}
              </span>
              <span className={won ? 'font-bold text-gold-bright' : 'shrink-0 text-navy-dark/50'}>
                {status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
