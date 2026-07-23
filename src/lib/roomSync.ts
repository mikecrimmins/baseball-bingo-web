import { supabase } from './supabase';
import type { Room, PlayerState, RoomStatus, CardSize } from './types';

/**
 * Sync layer over two Supabase tables, `rooms` and `players` (schema in
 * supabase/schema.sql).
 *
 * The key design choice: each writer owns distinct rows, so there are no
 * write conflicts.
 *   - A player updates only their own `players` row (marked + bingo flags).
 *   - The host/caller updates the `rooms` row (status, called_events).
 * Reads reassemble the full Room object from both tables. Realtime
 * subscriptions on each table trigger a lightweight refetch.
 */

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

type RoomRow = {
  room_code: string;
  status: RoomStatus;
  host_id: string;
  caller_mode: boolean;
  size: CardSize;
  called_events: string[] | null;
  started_at: number | null;
  ended_at: number | null;
};

type PlayerRow = {
  id: string;
  room_code: string;
  name: string;
  card: PlayerState['card'];
  marked: boolean[];
  has_bingo: boolean;
  has_blackout: boolean;
  is_caller: boolean;
  joined_at: number;
};

function rowToPlayer(r: PlayerRow): PlayerState {
  return {
    id: r.id,
    name: r.name,
    size: 5, // overwritten by assembleRoom with the room's size
    card: r.card,
    marked: r.marked,
    hasBingo: r.has_bingo,
    hasBlackout: r.has_blackout,
    isCaller: r.is_caller,
    joinedAt: r.joined_at,
  };
}

function playerToRow(p: PlayerState, roomCode: string): PlayerRow {
  return {
    id: p.id,
    room_code: roomCode,
    name: p.name,
    card: p.card,
    marked: p.marked,
    has_bingo: p.hasBingo,
    has_blackout: p.hasBlackout,
    is_caller: p.isCaller,
    joined_at: p.joinedAt,
  };
}

function assembleRoom(roomRow: RoomRow, playerRows: PlayerRow[]): Room {
  const players: Record<string, PlayerState> = {};
  for (const r of playerRows) players[r.id] = { ...rowToPlayer(r), size: roomRow.size };
  return {
    roomCode: roomRow.room_code,
    status: roomRow.status,
    hostId: roomRow.host_id,
    callerMode: roomRow.caller_mode,
    size: roomRow.size,
    players,
    calledEvents: roomRow.called_events ?? [],
    startedAt: roomRow.started_at,
    endedAt: roomRow.ended_at,
  };
}

/** True if a room with this code currently exists. */
export async function roomExists(roomCode: string): Promise<boolean> {
  const { data, error } = await client()
    .from('rooms')
    .select('room_code')
    .eq('room_code', roomCode)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/** Create a new room and insert the host as the first player. */
export async function createRoom(args: {
  roomCode: string;
  host: PlayerState;
  callerMode: boolean;
  size: CardSize;
}): Promise<Room> {
  const { roomCode, host, callerMode, size } = args;
  const db = client();
  const { error: roomErr } = await db.from('rooms').insert({
    room_code: roomCode,
    status: 'waiting',
    host_id: host.id,
    caller_mode: callerMode,
    size,
    called_events: [],
    started_at: null,
    ended_at: null,
  });
  if (roomErr) throw roomErr;
  const { error: playerErr } = await db.from('players').insert(playerToRow(host, roomCode));
  if (playerErr) throw playerErr;
  return fetchRoom(roomCode);
}

/**
 * Join an existing room. If a player row with this id already exists (rejoin
 * from the same browser), it is preserved so the card + marked state restore.
 */
export async function joinRoom(args: { roomCode: string; player: PlayerState }): Promise<Room> {
  const { roomCode, player } = args;
  const db = client();
  const { data: existing, error: existErr } = await db
    .from('players')
    .select('id')
    .eq('id', player.id)
    .eq('room_code', roomCode)
    .maybeSingle();
  if (existErr) throw existErr;
  if (!existing) {
    const { error } = await db.from('players').insert(playerToRow(player, roomCode));
    if (error) throw error;
  }
  return fetchRoom(roomCode);
}

/** Reassemble the full room from both tables. Throws if the room is gone. */
export async function fetchRoom(roomCode: string): Promise<Room> {
  const db = client();
  const [{ data: roomRow, error: roomErr }, { data: playerRows, error: playersErr }] =
    await Promise.all([
      db.from('rooms').select('*').eq('room_code', roomCode).maybeSingle(),
      db.from('players').select('*').eq('room_code', roomCode),
    ]);
  if (roomErr) throw roomErr;
  if (playersErr) throw playersErr;
  if (!roomRow) throw new Error(`Game ${roomCode} no longer exists.`);
  return assembleRoom(roomRow as RoomRow, (playerRows ?? []) as PlayerRow[]);
}

/** Patch a single player's mutable fields (their own row only). */
export async function updatePlayer(
  playerId: string,
  patch: Partial<Pick<PlayerState, 'marked' | 'hasBingo' | 'hasBlackout' | 'name'>>
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.marked !== undefined) row.marked = patch.marked;
  if (patch.hasBingo !== undefined) row.has_bingo = patch.hasBingo;
  if (patch.hasBlackout !== undefined) row.has_blackout = patch.hasBlackout;
  if (patch.name !== undefined) row.name = patch.name;
  const { error } = await client().from('players').update(row).eq('id', playerId);
  if (error) throw error;
}

/** Caller writes the full called-events list to the room row. */
export async function setCalledEvents(roomCode: string, calledEvents: string[]): Promise<void> {
  const { error } = await client()
    .from('rooms')
    .update({ called_events: calledEvents })
    .eq('room_code', roomCode);
  if (error) throw error;
}

/** Host flips the room to active. */
export async function startGame(roomCode: string, startedAt: number): Promise<void> {
  const { error } = await client()
    .from('rooms')
    .update({ status: 'active', started_at: startedAt })
    .eq('room_code', roomCode);
  if (error) throw error;
}

/** Host/caller ends the game. */
export async function endGame(roomCode: string, endedAt: number): Promise<void> {
  const { error } = await client()
    .from('rooms')
    .update({ status: 'ended', ended_at: endedAt })
    .eq('room_code', roomCode);
  if (error) throw error;
}

/** Remove a player's row (used when leaving the lobby). */
export async function leaveRoom(playerId: string): Promise<void> {
  const { error } = await client().from('players').delete().eq('id', playerId);
  if (error) throw error;
}

/**
 * Subscribe to all changes for a room across both tables. On any change we
 * refetch and hand back the assembled Room. Returns an unsubscribe function.
 */
export function subscribeRoom(
  roomCode: string,
  onChange: (room: Room) => void,
  onError?: (err: unknown) => void
): () => void {
  const db = client();
  const refetch = () => {
    fetchRoom(roomCode).then(onChange).catch((e) => onError?.(e));
  };
  const channel = db
    .channel(`room:${roomCode}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` },
      refetch
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${roomCode}` },
      refetch
    )
    .subscribe();
  return () => {
    db.removeChannel(channel);
  };
}
