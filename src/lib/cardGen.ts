import { ALL_EVENTS, type BingoEvent, FREE } from './events';
import type { CardSize } from './types';

/** Fisher–Yates shuffle. Returns a new array; does not mutate the input. */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Index of the FREE space in a generated card of this size (always the center cell). */
export function freeIndex(size: CardSize): number {
  return Math.floor((size * size) / 2);
}

/**
 * Generate a bingo card for the given size (3x3 or 5x5).
 * - FREE space always at the center index.
 * - The rest are drawn randomly from ALL_EVENTS, shuffled, no repeats.
 */
export function generateCard(size: CardSize): BingoEvent[] {
  const total = size * size;
  const picks = shuffle(ALL_EVENTS).slice(0, total - 1);
  const idx = freeIndex(size);
  return [...picks.slice(0, idx), FREE, ...picks.slice(idx)];
}

/** A fresh marked array: all false except the FREE center. */
export function freshMarked(size: CardSize): boolean[] {
  const marked = new Array(size * size).fill(false);
  marked[freeIndex(size)] = true;
  return marked;
}
