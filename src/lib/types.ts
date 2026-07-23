import type { BingoEvent } from './events';

/** Supported card sizes: 3x3 quick game, 5x5 full game. */
export type CardSize = 3 | 5;

export type RoomStatus = 'waiting' | 'active' | 'ended';

export type PlayerState = {
  id: string;
  name: string;
  size: CardSize;
  /** size*size event objects, generated client-side. */
  card: BingoEvent[];
  /** size*size booleans, FREE center pre-marked. */
  marked: boolean[];
  hasBingo: boolean;
  hasBlackout: boolean;
  isCaller: boolean;
  joinedAt: number;
};

export type Room = {
  roomCode: string;
  status: RoomStatus;
  hostId: string;
  callerMode: boolean;
  size: CardSize;
  players: Record<string, PlayerState>;
  /** Caller mode only: abbr strings called so far. */
  calledEvents: string[];
  startedAt: number | null;
  endedAt: number | null;
  /** Milestone 3: MLB game this room is following, if any (host-controlled). */
  mlbGamePk: number | null;
  mlbGameLabel: string | null;
};

export const MAX_PLAYERS = 8;
