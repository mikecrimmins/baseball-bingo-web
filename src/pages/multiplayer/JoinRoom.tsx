import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useRoom } from '../../lib/useRoom';
import { Logo } from '../../components/Logo';
import { Ticket } from '../../components/Ticket';

export function JoinRoom() {
  const navigate = useNavigate();
  const { code: codeParam } = useParams<{ code?: string }>();
  const { join, connecting, error, configured } = useRoom(null);
  const displayName = useGameStore((s) => s.displayName);
  const setDisplayName = useGameStore((s) => s.setDisplayName);

  const [code, setCode] = useState((codeParam ?? '').toUpperCase().slice(0, 4));
  const [name, setName] = useState(displayName);
  const [tearing, setTearing] = useState(false);
  const [nameError, setNameError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setDisplayName(name);
    try {
      await join(code, name);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        navigate(`/room/${code}/lobby`);
      } else {
        setTearing(true);
        setTimeout(() => navigate(`/room/${code}/lobby`), 380);
      }
    } catch {
      // error already surfaced via the hook's `error` state
    }
  }

  if (!configured) {
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

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-8 px-4 py-16">
      <div className="flex items-center justify-center gap-3 text-center">
        <Logo size={48} />
        <p className="headline text-3xl text-navy">Join a game</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <Ticket className={tearing ? 'animate-tear-stub' : ''}>
          <div className="flex flex-col gap-4">
            <span className="font-varsity text-center text-[10px] tracking-[0.15em] text-ink-faint uppercase">
              Game code
            </span>
            <div className="relative">
              <input
                required
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
                inputMode="text"
                pattern="[A-Za-z]{4}"
                title="4 letters"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                aria-label="4-letter game code"
                className="absolute inset-0 h-full w-full cursor-text opacity-0"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none flex justify-center gap-2 sm:gap-3"
              >
                {Array.from({ length: 4 }).map((_, i) => {
                  const char = code[i];
                  const isActive = i === code.length;
                  return (
                    <div
                      key={i}
                      className={[
                        'headline flex h-16 w-14 items-center justify-center rounded border-[1.5px] bg-paper text-3xl text-navy sm:h-20 sm:w-16 sm:text-4xl',
                        isActive ? 'border-stitch-red' : 'border-paper-edge',
                      ].join(' ')}
                    >
                      {char ?? (
                        isActive && (
                          <span className="h-8 w-[2px] animate-pulse bg-stitch-red motion-reduce:animate-none sm:h-10" />
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="text-center text-xs text-ink-faint">Enter the 4-letter game code.</p>
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
              {nameError && (
                <span className="text-xs font-medium text-stitch-red">Please enter your name.</span>
              )}
            </label>
          </div>
        </Ticket>

        {error && <p className="text-sm font-medium text-stitch-red">{error}</p>}

        <button
          type="submit"
          disabled={connecting || code.length !== 4}
          className="font-varsity rounded-[3px] bg-navy px-4 py-3 text-xs tracking-[0.12em] text-paper-bright uppercase transition-[colors,transform] duration-100 hover:bg-navy/90 active:scale-[0.98] active:bg-navy/80 disabled:opacity-60 disabled:active:scale-100"
        >
          {connecting ? 'Joining…' : 'Join game'}
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
