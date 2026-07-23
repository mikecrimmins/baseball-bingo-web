import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '../lib/types';
import { generatePlayerId } from '../lib/roomCode';

/**
 * Multiplayer room state. The subscription/side-effect logic lives in the
 * useRoom hook; this store is the shared container it writes into.
 *
 * `playerId` is generated once per browser and persisted to localStorage,
 * which is what lets a player refresh mid-game (or close and reopen the tab)
 * and rejoin the same room with their card + marked state restored.
 */
type RoomStoreState = {
  playerId: string;
  /** The room this device is the host of, if any (drives lobby UI + cleanup). */
  hostedRoomCode: string | null;
  /** The room this device is currently subscribed to. */
  roomCode: string | null;
  room: Room | null;
  connecting: boolean;
  error: string | null;

  setRoom: (room: Room | null) => void;
  setRoomCode: (code: string | null) => void;
  setHostedRoomCode: (code: string | null) => void;
  setConnecting: (value: boolean) => void;
  setError: (message: string | null) => void;
  /** Clear all live room state (keeps the persistent playerId). */
  reset: () => void;
};

export const useRoomStore = create<RoomStoreState>()(
  persist(
    (set) => ({
      playerId: generatePlayerId(),
      hostedRoomCode: null,
      roomCode: null,
      room: null,
      connecting: false,
      error: null,

      setRoom: (room) => set({ room }),
      setRoomCode: (roomCode) => set({ roomCode }),
      setHostedRoomCode: (hostedRoomCode) => set({ hostedRoomCode }),
      setConnecting: (connecting) => set({ connecting }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          hostedRoomCode: null,
          roomCode: null,
          room: null,
          connecting: false,
          error: null,
        }),
    }),
    {
      name: 'baseball-bingo-room',
      // Only the device identity persists. The active room comes from the
      // URL (shareable + survives refresh on its own); live room state is
      // refetched fresh from Supabase whenever the subscription (re)mounts.
      partialize: (s) => ({ playerId: s.playerId }),
    }
  )
);
