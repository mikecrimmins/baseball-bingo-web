import { useEffect, useRef, useState } from 'react';
import type { PlayerState } from '../lib/types';
import { PennantBanner } from './PennantBanner';

type Announcement = { playerId: string; name: string; state: 'bingo' | 'blackout' };

/**
 * Watches the room's players for a new bingo/blackout and announces it to
 * everyone — "broadcasts to the whole room" per the room game's win rule.
 * Queues announcements if more than one lands close together so they don't
 * stack on screen.
 */
export function AnnouncementBanner({ players, meId }: { players: PlayerState[]; meId: string }) {
  const [queue, setQueue] = useState<Announcement[]>([]);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const fresh: Announcement[] = [];
    for (const p of players) {
      const state: 'bingo' | 'blackout' | null = p.hasBlackout ? 'blackout' : p.hasBingo ? 'bingo' : null;
      if (!state) continue;
      const key = `${p.id}:${state}`;
      if (seen.current.has(key)) continue;
      seen.current.add(key);
      fresh.push({ playerId: p.id, name: p.name, state });
    }
    if (fresh.length) setQueue((q) => [...q, ...fresh]);
  }, [players]);

  const current = queue[0];
  if (!current) return null;

  const dismiss = () => setQueue((q) => q.slice(1));
  const isMe = current.playerId === meId;

  return (
    <PennantBanner
      title={current.state === 'blackout' ? 'Blackout!' : 'Bingo!'}
      subtitle={isMe ? 'You got it — nice call.' : `${current.name} called it.`}
      onBackdropClick={dismiss}
    >
      <button
        type="button"
        onClick={dismiss}
        className="font-varsity rounded-[3px] bg-paper-bright px-4 py-3 text-xs tracking-[0.1em] text-navy uppercase transition-colors hover:bg-paper"
      >
        Nice!
      </button>
    </PennantBanner>
  );
}
