import { useEffect, useRef, useState } from 'react';
import type { PlayerState } from '../lib/types';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/60 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="animate-banner-in w-full max-w-sm rounded-2xl border-4 border-gold-bright bg-gold p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-vintage text-4xl tracking-wide text-navy-dark sm:text-5xl">
          {current.state === 'blackout' ? 'BLACKOUT!' : 'BINGO!'}
        </p>
        <p className="mt-2 text-sm font-medium text-navy-dark/80">
          {isMe ? 'You got it — nice call.' : `${current.name} called it.`}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-lg bg-navy px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-light"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}
