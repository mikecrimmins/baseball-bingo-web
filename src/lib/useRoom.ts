import { useCallback, useEffect, useMemo } from 'react';
import { useRoomStore } from '../store/roomStore';
import { checkBingo, checkBlackout } from './bingoDetect';
import { generateCard, freshMarked } from './cardGen';
import { generateRoomCode } from './roomCode';
import { isSupabaseConfigured } from './supabase';
import type { PlayerState, CardSize } from './types';
import { MAX_PLAYERS } from './types';
import * as sync from './roomSync';

function buildPlayer(id: string, name: string, isCaller: boolean, size: CardSize): PlayerState {
  return {
    id,
    name: name.trim() || 'Player',
    size,
    card: generateCard(size),
    marked: freshMarked(size),
    hasBingo: false,
    hasBlackout: false,
    isCaller,
    joinedAt: Date.now(),
  };
}

async function pushMarked(playerId: string, marked: boolean[], size: CardSize) {
  await sync.updatePlayer(playerId, {
    marked,
    hasBingo: checkBingo(marked, size),
    hasBlackout: checkBlackout(marked, size),
  });
}

/**
 * Owns the realtime room subscription and exposes the player's view of the
 * room plus all multiplayer actions. Mounted by the lobby, game, and caller
 * pages (they share the same store, so the subscription is established once
 * per room code).
 */
export function useRoom(roomCode: string | null) {
  const playerId = useRoomStore((s) => s.playerId);
  const room = useRoomStore((s) => s.room);
  const connecting = useRoomStore((s) => s.connecting);
  const error = useRoomStore((s) => s.error);

  // Subscribe whenever the active room code changes.
  useEffect(() => {
    if (!roomCode || !isSupabaseConfigured) return;
    const { setRoom, setError } = useRoomStore.getState();
    const unsubscribe = sync.subscribeRoom(
      roomCode,
      (r) => setRoom(r),
      (e) => setError(e instanceof Error ? e.message : 'Connection error')
    );
    // Initial fetch so we don't wait for the first realtime event.
    sync.fetchRoom(roomCode).then(setRoom).catch(() => {});
    return () => {
      unsubscribe();
      useRoomStore.getState().setRoom(null);
    };
  }, [roomCode]);

  const me = room && room.players[playerId];
  const isHost = !!room && room.hostId === playerId;
  const isCaller = !!me?.isCaller;

  const players = useMemo(
    () => (room ? Object.values(room.players).sort((a, b) => a.joinedAt - b.joinedAt) : []),
    [room]
  );
  const otherPlayers = useMemo(() => players.filter((p) => p.id !== playerId), [players, playerId]);

  // ---- Actions ----

  /** Create a new room, return its code. */
  const host = useCallback(async (name: string, callerMode: boolean, size: CardSize) => {
    const store = useRoomStore.getState();
    store.setConnecting(true);
    store.setError(null);
    try {
      let code = generateRoomCode();
      for (let i = 0; i < 5 && (await sync.roomExists(code)); i++) {
        code = generateRoomCode();
      }
      const player = buildPlayer(store.playerId, name, callerMode, size);
      await sync.createRoom({ roomCode: code, host: player, callerMode, size });
      store.setHostedRoomCode(code);
      return code;
    } catch (e) {
      store.setError(e instanceof Error ? e.message : 'Could not create game');
      throw e;
    } finally {
      store.setConnecting(false);
    }
  }, []);

/**
   * Try to restore an existing session for this room (same browser, same
   * playerId already has a row) — used on a fresh load of a room URL, e.g.
   * after a refresh. 'not-joined' means the room exists but this browser
   * hasn't joined it yet (caller should prompt for a name and call `join`);
   * 'not-found' means the code doesn't match any room.
   */
  const resume = useCallback(async (code: string): Promise<'restored' | 'not-joined' | 'not-found'> => {
    const store = useRoomStore.getState();
    store.setConnecting(true);
    store.setError(null);
    try {
      const room = await sync.fetchRoom(code);
      return room.players[store.playerId] ? 'restored' : 'not-joined';
    } catch {
      return 'not-found';
    } finally {
      store.setConnecting(false);
    }
  }, []);

  const join = useCallback(async (code: string, name: string) => {
    const store = useRoomStore.getState();
    store.setConnecting(true);
    store.setError(null);
    try {
      const current = await sync.fetchRoom(code);
      const alreadyIn = !!current.players[store.playerId];
      if (!alreadyIn && Object.keys(current.players).length >= MAX_PLAYERS) {
        throw new Error('This game is full (max 8 players).');
      }
      // Card size is the room's, not the joining player's choice.
      const player = buildPlayer(store.playerId, name, false, current.size);
      await sync.joinRoom({ roomCode: code, player });
    } catch (e) {
      store.setError(e instanceof Error ? e.message : 'Could not join game');
      throw e;
    } finally {
      store.setConnecting(false);
    }
  }, []);

  const start = useCallback(async () => {
    if (!roomCode) return;
    await sync.startGame(roomCode, Date.now());
  }, [roomCode]);

  /**
   * Toggle a cell. This is the single interaction for both manual marking
   * and confirming a called event — a "called" cell just renders with a
   * pulse until the player taps it (see `calledPending` below).
   */
  const toggleCell = useCallback((index: number) => {
    const store = useRoomStore.getState();
    const r = store.room;
    if (!r) return;
    const current = r.players[store.playerId];
    if (!current) return;
    if (index === Math.floor((current.size * current.size) / 2)) return; // FREE never toggles
    const next = current.marked.slice();
    next[index] = !next[index];
    store.setRoom({
      ...r,
      players: {
        ...r.players,
        [store.playerId]: {
          ...current,
          marked: next,
          hasBingo: checkBingo(next, current.size),
          hasBlackout: checkBlackout(next, current.size),
        },
      },
    });
    pushMarked(store.playerId, next, current.size).catch(() => {});
  }, []);

  const callEvent = useCallback(
    async (abbr: string) => {
      const store = useRoomStore.getState();
      const r = store.room;
      if (!r || !roomCode) return;
      const set = new Set(r.calledEvents);
      if (set.has(abbr)) set.delete(abbr);
      else set.add(abbr);
      const calledEvents = Array.from(set);
      store.setRoom({ ...r, calledEvents }); // optimistic
      await sync.setCalledEvents(roomCode, calledEvents);
    },
    [roomCode]
  );

  const end = useCallback(async () => {
    if (!roomCode) return;
    await sync.endGame(roomCode, Date.now());
  }, [roomCode]);

  /** Host attaches an MLB game for the whole room to follow. */
  const followGame = useCallback(
    async (gamePk: number, label: string) => {
      const store = useRoomStore.getState();
      const r = store.room;
      if (!r || !roomCode) return;
      store.setRoom({ ...r, mlbGamePk: gamePk, mlbGameLabel: label }); // optimistic
      await sync.setLiveGame(roomCode, gamePk, label);
    },
    [roomCode]
  );

  const unfollowGame = useCallback(async () => {
    const store = useRoomStore.getState();
    const r = store.room;
    if (!r || !roomCode) return;
    store.setRoom({ ...r, mlbGamePk: null, mlbGameLabel: null }); // optimistic
    await sync.setLiveGame(roomCode, null, null);
  }, [roomCode]);

  const leave = useCallback(async () => {
    const store = useRoomStore.getState();
    try {
      await sync.leaveRoom(store.playerId);
    } catch {
      // best-effort
    }
    store.reset();
  }, []);

  /** Cells that are called but not yet marked — render as "confirm to mark". */
  const calledPending = useMemo(() => {
    if (!room || !me) return new Set<number>();
    const called = new Set(room.calledEvents);
    const pending = new Set<number>();
    me.card.forEach((event, i) => {
      if (!event.free && called.has(event.abbr) && !me.marked[i]) pending.add(i);
    });
    return pending;
  }, [room, me]);

  return {
    playerId,
    room,
    me,
    isHost,
    isCaller,
    players,
    otherPlayers,
    calledPending,
    connecting,
    error,
    configured: isSupabaseConfigured,
    host,
    resume,
    join,
    start,
    toggleCell,
    callEvent,
    end,
    leave,
    followGame,
    unfollowGame,
  };
}
