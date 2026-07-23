import type { CardSize } from './types';
import { freeIndex } from './cardGen';

/** The winning lines for a given card size: rows, columns, and both diagonals. */
export function bingoLines(size: CardSize): number[][] {
  const lines: number[][] = [];
  for (let r = 0; r < size; r++) {
    lines.push(Array.from({ length: size }, (_, c) => r * size + c));
  }
  for (let c = 0; c < size; c++) {
    lines.push(Array.from({ length: size }, (_, r) => r * size + c));
  }
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
  return lines;
}

/** Returns the set of completed winning lines (each a list of indices). */
export function completedLines(marked: readonly boolean[], size: CardSize): number[][] {
  return bingoLines(size).filter((line) => line.every((i) => marked[i]));
}

/** True if at least one full bingo line is marked. */
export function checkBingo(marked: readonly boolean[], size: CardSize): boolean {
  return completedLines(marked, size).length > 0;
}

/** True if every cell is marked (including FREE). */
export function checkBlackout(marked: readonly boolean[], size: CardSize): boolean {
  const total = size * size;
  return marked.length === total && marked.every(Boolean);
}

/** The set of cell indices that belong to any completed winning line. */
export function winningCells(marked: readonly boolean[], size: CardSize): Set<number> {
  const cells = new Set<number>();
  for (const line of completedLines(marked, size)) {
    for (const i of line) cells.add(i);
  }
  return cells;
}

/** Count of player-marked cells excluding the FREE center. */
export function markedCount(marked: readonly boolean[], size: CardSize): number {
  const free = freeIndex(size);
  let count = 0;
  for (let i = 0; i < marked.length; i++) {
    if (i === free) continue;
    if (marked[i]) count++;
  }
  return count;
}
