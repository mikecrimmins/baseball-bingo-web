import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useRoom } from '../../lib/useRoom';
import { useRoomSession } from '../../lib/useRoomSession';
import { Logo } from '../../components/Logo';

export function Lobby() {
  const { code } = useParams<{ code: string }>();
  const status = useRoomSession(code);

  if (status === 'checking') return <CenteredNote text="Loading game…" />;
  if (status === 'not-found') return <RoomNotFound />;
  return <LobbyReady code={code as string} />;
}

function LobbyReady({ code }: { code: string }) {
  const navigate = useNavigate();
  const { room, isHost, isCaller, players, start, leave, error } = useRoom(code);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  // Once the host starts the game, everyone's realtime room state flips to
  // 'active' — jump to the right screen automatically.
  useEffect(() => {
    if (room?.status === 'active') {
      navigate(`/room/${code}/${isCaller ? 'caller' : 'play'}`, { replace: true });
    }
  }, [room?.status, isCaller, code, navigate]);

  if (!room) return <CenteredNote text="Loading game…" />;

  const link = `${window.location.origin}/join/${code}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access can fail silently (permissions) — the code is still visible
    }
  }

  async function handleStart() {
    setStarting(true);
    try {
      await start();
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-8 px-4 py-16">
      <div className="flex items-center justify-center gap-3 text-center">
        <Logo size={48} />
        <p className="font-vintage text-3xl text-navy">Lobby</p>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-navy-light/25 bg-white p-5 text-center">
        <span className="text-xs font-semibold tracking-wide text-navy-dark/60 uppercase">
          Game code
        </span>
        <span className="font-condensed text-4xl tracking-[0.3em] text-navy">{code}</span>
        <button
          type="button"
          onClick={copyLink}
          className="mt-1 rounded-lg border-2 border-navy-light/25 px-3 py-1.5 text-xs font-semibold text-navy-dark transition-colors hover:bg-navy/5"
        >
          {copied ? 'Link copied!' : 'Copy invite link'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-navy-dark/80">
          Players ({players.length})
        </span>
        <ul className="flex flex-col gap-1.5">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg border-2 border-navy-light/20 bg-white px-3 py-2 text-sm"
            >
              <span className="font-medium text-navy-dark">{p.name}</span>
              <span className="flex gap-1.5">
                {p.id === room.hostId && (
                  <span className="rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                    Host
                  </span>
                )}
                {p.isCaller && (
                  <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-navy-dark uppercase">
                    Caller
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm font-medium text-red-700">{error}</p>}

      {isHost ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="rounded-lg bg-navy px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-light disabled:opacity-60"
        >
          {starting ? 'Starting…' : 'Start game'}
        </button>
      ) : (
        <p className="text-center text-sm text-navy-dark/60">Waiting for the host to start…</p>
      )}

      <button
        type="button"
        onClick={() => {
          leave();
          navigate('/');
        }}
        className="text-center text-sm text-navy-dark/60 hover:underline"
      >
        Leave game
      </button>
    </div>
  );
}

function RoomNotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-vintage text-2xl text-navy">Game not found</p>
      <p className="text-sm text-navy-dark/70">
        That code doesn't match a game — it may have expired or been typed wrong.
      </p>
      <Link
        to="/join"
        className="rounded-lg border-2 border-navy px-4 py-2.5 text-sm font-semibold text-navy hover:bg-navy/10"
      >
        Try another code
      </Link>
    </div>
  );
}

function CenteredNote({ text }: { text: string }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md items-center justify-center px-4 py-16 text-center text-sm text-navy-dark/60">
      {text}
    </div>
  );
}
