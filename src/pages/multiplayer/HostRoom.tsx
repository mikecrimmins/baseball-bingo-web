import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useRoom } from '../../lib/useRoom';
import { Logo } from '../../components/Logo';
import type { CardSize } from '../../lib/types';

export function HostRoom() {
  const navigate = useNavigate();
  const { host, connecting, error, configured } = useRoom(null);
  const displayName = useGameStore((s) => s.displayName);
  const setDisplayName = useGameStore((s) => s.setDisplayName);

  const [name, setName] = useState(displayName);
  const [size, setSize] = useState<CardSize>(5);
  const [callerMode, setCallerMode] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDisplayName(name);
    const code = await host(name, callerMode, size);
    navigate(`/room/${code}/lobby`);
  }

  if (!configured) {
    return <SetupNotice />;
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-8 px-4 py-16">
      <div className="flex items-center justify-center gap-3 text-center">
        <Logo size={48} />
        <p className="font-vintage text-3xl text-navy">Host a game</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-navy-dark/80">Your name</span>
          <input
            required
            maxLength={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player"
            className="rounded-lg border-2 border-navy-light/25 bg-white px-3 py-2.5 text-navy-dark outline-none focus:border-gold"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-navy-dark/80">Card size</span>
          <div className="grid grid-cols-2 gap-2">
            {([3, 5] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={[
                  'rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-colors',
                  size === s
                    ? 'border-navy bg-navy text-white'
                    : 'border-navy-light/25 bg-white text-navy-dark hover:bg-navy/5',
                ].join(' ')}
              >
                {s}×{s} {s === 3 ? '— quick' : '— full'}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-lg border-2 border-navy-light/25 bg-white p-3">
          <input
            type="checkbox"
            checked={callerMode}
            onChange={(e) => setCallerMode(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-navy"
          />
          <span className="text-sm text-navy-dark">
            <span className="font-semibold">I'll be the caller</span> — I'll watch the event list
            and tap plays as they happen; everyone's card highlights the match. (Everyone can still
            mark manually either way.)
          </span>
        </label>

        {error && <p className="text-sm font-medium text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={connecting}
          className="rounded-lg bg-navy px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-light disabled:opacity-60"
        >
          {connecting ? 'Creating game…' : 'Create game'}
        </button>

        <Link to="/" className="text-center text-sm text-navy-dark/60 hover:underline">
          Back
        </Link>
      </form>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-vintage text-2xl text-navy">Multiplayer isn't configured yet</p>
      <p className="text-sm text-navy-dark/70">
        This deployment doesn't have Supabase environment variables set, so games aren't
        available. Solo play still works fully.
      </p>
      <Link
        to="/"
        className="rounded-lg border-2 border-navy px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy/10"
      >
        Back to solo play
      </Link>
    </div>
  );
}
