import { useMemo } from 'react';
import { checkBingo, checkBlackout, winningCells, markedCount } from './bingoDetect';
import type { CardSize } from './types';

export type WinState = 'blackout' | 'bingo' | 'progress';

export type BingoDerived = {
  bingo: boolean;
  blackout: boolean;
  /** Indices that are part of a completed line. */
  winning: Set<number>;
  /** Player-marked cells excluding FREE. */
  count: number;
  /** Win state in priority order: blackout > bingo > progress. */
  winState: WinState;
};

/**
 * Derives all win/progress state from a marked array. Pure and memoized —
 * shared by solo and multiplayer game views.
 */
export function useBingoGame(marked: readonly boolean[], size: CardSize): BingoDerived {
  return useMemo(() => {
    const blackout = checkBlackout(marked, size);
    const bingo = checkBingo(marked, size);
    return {
      blackout,
      bingo,
      winning: winningCells(marked, size),
      count: markedCount(marked, size),
      winState: blackout ? 'blackout' : bingo ? 'bingo' : 'progress',
    };
  }, [marked, size]);
}
