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
  const [nameError, setNameError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
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
        <p className="headline text-3xl text-navy">Host a game</p>
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-6 rounded border-[1.5px] border-navy bg-paper-bright p-5"
      >
        <label className="flex flex-col gap-1.5">
          <span className="font-varsity text-xs tracking-[0.12em] text-ink-muted uppercase">
            Your name
          </span>
          <input
            maxLength={24}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(false);
            }}
            placeholder="Player"
            aria-invalid={nameError}
            className={[
              'rounded-[3px] border-[1.5px] bg-paper px-3 py-2.5 text-navy outline-none focus:border-stitch-red',
              nameError ? 'border-stitch-red' : 'border-paper-edge',
            ].join(' ')}
          />
          {nameError && <span className="text-xs font-medium text-stitch-red">Please enter your name.</span>}
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="font-varsity text-xs tracking-[0.12em] text-ink-muted uppercase">
            Card size
          </span>
          <div className="grid grid-cols-2 gap-2">
            {([3, 5] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={[
                  'rounded-[3px] border-[1.5px] px-3 py-2.5 text-sm font-medium transition-colors',
                  size === s
                    ? 'border-navy bg-navy text-paper-bright'
                    : 'border-paper-edge bg-paper text-navy hover:bg-paper-edge/30 active:bg-paper-edge/50',
                ].join(' ')}
              >
                {s}×{s} {s === 3 ? '— quick' : '— full'}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-[3px] border-[1.5px] border-paper-edge bg-paper p-3">
          <input
            type="checkbox"
            checked={callerMode}
            onChange={(e) => setCallerMode(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-stitch-red"
          />
          <span className="text-sm text-navy">
            <span className="font-semibold">I'll be the caller</span> — I'll watch the event list
            and tap plays as they happen; everyone's card highlights the match. (Everyone can still
            mark manually either way.)
          </span>
        </label>

        {error && <p className="text-sm font-medium text-stitch-red">{error}</p>}

        <button
          type="submit"
          disabled={connecting}
          className="font-varsity rounded-[3px] bg-navy px-4 py-3 text-xs tracking-[0.12em] text-paper-bright uppercase transition-[colors,transform] duration-100 hover:bg-navy/90 active:scale-[0.98] active:bg-navy/80 disabled:opacity-60 disabled:active:scale-100"
        >
          {connecting ? 'Creating game…' : 'Create game'}
        </button>

        <Link
          to="/"
          className="text-center text-sm text-ink-faint underline decoration-dotted underline-offset-4 hover:text-navy"
        >
          Back
        </Link>
      </form>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="headline text-2xl text-navy">Multiplayer isn't configured yet</p>
      <p className="text-sm text-ink-muted">
        This deployment doesn't have Supabase environment variables set, so games aren't
        available. Solo play still works fully.
      </p>
      <Link
        to="/"
        className="font-varsity rounded-[3px] border-[1.5px] border-navy px-4 py-2.5 text-xs tracking-[0.12em] text-navy uppercase hover:bg-navy/5"
      >
        Back to solo play
      </Link>
    </div>
  );
}
