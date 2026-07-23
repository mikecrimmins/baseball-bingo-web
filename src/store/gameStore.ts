import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BingoEvent } from '../lib/events';
import { generateCard, freshMarked, freeIndex } from '../lib/cardGen';
import type { CardSize } from '../lib/types';

/**
 * Local solo-game store. Persisted to localStorage so a refresh (or closing
 * the tab mid-game) restores the current card and marks.
 */
type GameState = {
  size: CardSize | null;
  card: BingoEvent[];
  marked: boolean[];
  displayName: string;

  /** Generate a fresh card of the given size and reset marks. */
  newCard: (size: CardSize) => void;
  /** Toggle a cell's marked state (no-op on the FREE center). */
  toggleCell: (index: number) => void;
  setDisplayName: (name: string) => void;
  reset: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      size: null,
      card: [],
      marked: [],
      displayName: '',

      newCard: (size) => set({ size, card: generateCard(size), marked: freshMarked(size) }),

      toggleCell: (index) => {
        const { size, marked } = get();
        if (!size || index === freeIndex(size)) return;
        const next = marked.slice();
        next[index] = !next[index];
        set({ marked: next });
      },

      setDisplayName: (name) => set({ displayName: name }),

      reset: () => set({ size: null, card: [], marked: [] }),
    }),
    {
      name: 'baseball-bingo-solo',
      partialize: (s) => ({
        size: s.size,
        card: s.card,
        marked: s.marked,
        displayName: s.displayName,
      }),
    }
  )
);
