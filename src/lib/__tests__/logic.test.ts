import { describe, it, expect } from 'vitest';
import { ALL_EVENTS, FREE } from '../events';
import { generateCard, freshMarked, shuffle, freeIndex } from '../cardGen';
import { bingoLines, checkBingo, checkBlackout, winningCells, markedCount, completedLines } from '../bingoDetect';
import { generateRoomCode } from '../roomCode';
import type { CardSize } from '../types';

const SIZES: CardSize[] = [3, 5];

describe('event library', () => {
  it('has 40 unique events', () => {
    expect(ALL_EVENTS).toHaveLength(40);
    const abbrs = new Set(ALL_EVENTS.map((e) => e.abbr));
    expect(abbrs.size).toBe(40);
  });
});

describe('shuffle', () => {
  it('returns a new array with the same members', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).not.toBe(input);
    expect([...out].sort()).toEqual([...input].sort());
  });
});

describe.each(SIZES)('generateCard(%i)', (size) => {
  const total = size * size;

  it(`produces ${total} cells with FREE in the center`, () => {
    const card = generateCard(size);
    expect(card).toHaveLength(total);
    expect(card[freeIndex(size)]).toBe(FREE);
    expect(card[freeIndex(size)].free).toBe(true);
  });

  it('uses distinct non-free events drawn from the library, no repeats', () => {
    const card = generateCard(size);
    const playable = card.filter((_, i) => i !== freeIndex(size));
    expect(playable).toHaveLength(total - 1);
    const abbrs = new Set(playable.map((e) => e.abbr));
    expect(abbrs.size).toBe(total - 1);
    for (const e of playable) {
      expect(ALL_EVENTS.some((a) => a.abbr === e.abbr)).toBe(true);
      expect(e.free).toBeFalsy();
    }
  });

  it('freshMarked marks only the FREE center', () => {
    const m = freshMarked(size);
    expect(m).toHaveLength(total);
    expect(m[freeIndex(size)]).toBe(true);
    expect(m.filter(Boolean)).toHaveLength(1);
  });
});

describe('bingo detection (5x5)', () => {
  it('has 12 lines (5 rows, 5 cols, 2 diagonals)', () => {
    expect(bingoLines(5)).toHaveLength(12);
  });

  it('detects no bingo on a fresh card', () => {
    expect(checkBingo(freshMarked(5), 5)).toBe(false);
  });

  it('detects a completed row', () => {
    const m = freshMarked(5);
    [0, 1, 2, 3, 4].forEach((i) => (m[i] = true));
    expect(checkBingo(m, 5)).toBe(true);
    expect(completedLines(m, 5)).toContainEqual([0, 1, 2, 3, 4]);
  });

  it('FREE center contributes to a diagonal win', () => {
    const m = freshMarked(5); // index 12 already true
    [0, 6, 18, 24].forEach((i) => (m[i] = true));
    expect(checkBingo(m, 5)).toBe(true);
    expect(winningCells(m, 5).has(12)).toBe(true);
  });

  it('detects blackout only when all 25 are marked', () => {
    const m = new Array(25).fill(true);
    expect(checkBlackout(m, 5)).toBe(true);
    m[7] = false;
    expect(checkBlackout(m, 5)).toBe(false);
  });

  it('markedCount excludes the FREE center', () => {
    const m = freshMarked(5);
    expect(markedCount(m, 5)).toBe(0);
    m[0] = true;
    m[1] = true;
    expect(markedCount(m, 5)).toBe(2);
  });
});

describe('bingo detection (3x3)', () => {
  it('has 8 lines (3 rows, 3 cols, 2 diagonals)', () => {
    expect(bingoLines(3)).toHaveLength(8);
  });

  it('detects a completed column', () => {
    const m = freshMarked(3);
    [0, 3, 6].forEach((i) => (m[i] = true));
    expect(checkBingo(m, 3)).toBe(true);
    expect(completedLines(m, 3)).toContainEqual([0, 3, 6]);
  });

  it('blackout requires all 9 cells', () => {
    const m = new Array(9).fill(true);
    expect(checkBlackout(m, 3)).toBe(true);
    m[4] = false;
    expect(checkBlackout(m, 3)).toBe(false);
  });
});

describe('generateRoomCode', () => {
  it('produces a 4-letter uppercase string', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z]{4}$/);
    }
  });
});
