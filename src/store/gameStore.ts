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
  /** MLB gamePk this card is following, if any (Milestone 3). */
  liveGamePk: number | null;
  liveGameLabel: string | null;

  /** Generate a fresh card of the given size and reset marks. */
  newCard: (size: CardSize) => void;
  /** Toggle a cell's marked state (no-op on the FREE center). */
  toggleCell: (index: number) => void;
  setDisplayName: (name: string) => void;
  followGame: (gamePk: number, label: string) => void;
  unfollowGame: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      size: null,
      card: [],
      marked: [],
      displayName: '',
      liveGamePk: null,
      liveGameLabel: null,

      newCard: (size) =>
        set({
          size,
          card: generateCard(size),
          marked: freshMarked(size),
          liveGamePk: null,
          liveGameLabel: null,
        }),

      toggleCell: (index) => {
        const { size, marked } = get();
        if (!size || index === freeIndex(size)) return;
        const next = marked.slice();
        next[index] = !next[index];
        set({ marked: next });
      },

      setDisplayName: (name) => set({ displayName: name }),

      followGame: (gamePk, label) => set({ liveGamePk: gamePk, liveGameLabel: label }),
      unfollowGame: () => set({ liveGamePk: null, liveGameLabel: null }),

      reset: () => set({ size: null, card: [], marked: [], liveGamePk: null, liveGameLabel: null }),
    }),
    {
      name: 'baseball-bingo-solo',
      partialize: (s) => ({
        size: s.size,
        card: s.card,
        marked: s.marked,
        displayName: s.displayName,
        liveGamePk: s.liveGamePk,
        liveGameLabel: s.liveGameLabel,
      }),
    }
  )
);
