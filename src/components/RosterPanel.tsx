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
    <div className="flex flex-col gap-2 rounded border-[1.5px] border-navy bg-paper-bright p-4">
      <span className="font-varsity text-xs tracking-[0.12em] text-ink-muted uppercase">
        Players
      </span>
      <ul className="flex flex-col gap-1.5">
        {players.map((p) => {
          const linesNeed = closestLineNeed(p.marked, size);
          const status = p.hasBlackout
            ? 'Blackout!'
            : p.hasBingo
              ? 'Bingo!'
              : `${linesNeed} to win`;
          const won = p.hasBingo || p.hasBlackout;
          return (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <span className={p.id === meId ? 'font-semibold text-navy' : 'text-navy'}>
                {p.name}
                {p.id === meId && ' (you)'}
                {p.id === hostId && (
                  <span className="font-varsity ml-1.5 text-[10px] tracking-wide text-ink-faint uppercase">
                    host
                  </span>
                )}
              </span>
              <span className={won ? 'font-bold text-stitch-red' : 'shrink-0 text-ink-faint'}>
                {status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
