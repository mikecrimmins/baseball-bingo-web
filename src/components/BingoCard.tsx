import type { BingoEvent } from '../lib/events';
import type { CardSize } from '../lib/types';
import { BingoCell } from './BingoCell';

type Props = {
  size: CardSize;
  card: BingoEvent[];
  marked: boolean[];
  winning: Set<number>;
  onToggle: (index: number) => void;
};

export function BingoCard({ size, card, marked, winning, onToggle }: Props) {
  return (
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
          onToggle={() => onToggle(i)}
        />
      ))}
    </div>
  );
}
