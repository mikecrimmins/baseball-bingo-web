import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useGameStore } from '../../store/gameStore';
import { useRoom } from '../../lib/useRoom';
import { Logo } from '../../components/Logo';

export function JoinRoom() {
  const navigate = useNavigate();
  const { code: codeParam } = useParams<{ code?: string }>();
  const { join, connecting, error, configured } = useRoom(null);
  const displayName = useGameStore((s) => s.displayName);
  const setDisplayName = useGameStore((s) => s.setDisplayName);

  const [code, setCode] = useState((codeParam ?? '').toUpperCase().slice(0, 4));
  const [name, setName] = useState(displayName);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setDisplayName(name);
    try {
      await join(code, name);
      navigate(`/room/${code}/lobby`);
    } catch {
      // error already surfaced via the hook's `error` state
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="font-vintage text-2xl text-navy">Multiplayer isn't configured yet</p>
        <p className="text-sm text-navy-dark/70">
          This deployment doesn't have Supabase environment variables set, so rooms aren't
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

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-8 px-4 py-16">
      <div className="flex items-center justify-center gap-3 text-center">
        <Logo size={48} />
        <p className="font-vintage text-3xl text-navy">Join a room</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-navy-dark/80">Room code</span>
          <input
            required
            pattern="[A-Za-z]{4}"
            title="4 letters"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            placeholder="ABCD"
            className="rounded-lg border-2 border-navy-light/25 bg-white px-3 py-2.5 text-center font-condensed text-2xl tracking-[0.3em] text-navy-dark uppercase outline-none focus:border-gold"
          />
        </label>

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

        {error && <p className="text-sm font-medium text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={connecting || code.length !== 4}
          className="rounded-lg bg-navy px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-light disabled:opacity-60"
        >
          {connecting ? 'Joining…' : 'Join room'}
        </button>

        <Link to="/" className="text-center text-sm text-navy-dark/60 hover:underline">
          Back
        </Link>
      </form>
    </div>
  );
}
