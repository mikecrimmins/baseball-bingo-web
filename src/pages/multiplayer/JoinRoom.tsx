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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
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
            <div className="font-varsity flex justify-between text-[10px] tracking-[0.15em] text-ink-faint uppercase">
              <span>Section</span>
              <span>Row</span>
              <span>Seat</span>
            </div>
            <input
              required
              pattern="[A-Za-z]{4}"
              title="4 letters"
              maxLength={4}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              placeholder="ABCD"
              className="headline w-full border-0 bg-transparent text-center text-4xl tracking-[0.3em] text-navy outline-none placeholder:text-paper-edge"
            />
            <label className="flex flex-col gap-1.5">
              <span className="font-varsity text-xs tracking-[0.12em] text-ink-muted uppercase">
                Your name
              </span>
              <input
                required
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Player"
                className="rounded-[3px] border-[1.5px] border-paper-edge bg-paper px-3 py-2.5 text-navy outline-none focus:border-stitch-red"
              />
            </label>
          </div>
        </Ticket>

        {error && <p className="text-sm font-medium text-stitch-red">{error}</p>}

        <button
          type="submit"
          disabled={connecting || code.length !== 4}
          className="font-varsity rounded-[3px] bg-navy px-4 py-3 text-xs tracking-[0.12em] text-paper-bright uppercase transition-colors hover:bg-navy/90 disabled:opacity-60"
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
