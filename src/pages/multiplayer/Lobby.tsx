import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useRoom } from '../../lib/useRoom';
import { useRoomSession } from '../../lib/useRoomSession';
import { Logo } from '../../components/Logo';
import { Ticket } from '../../components/Ticket';
import { StampBadge } from '../../components/StampBadge';

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
        <p className="headline text-3xl text-navy">Lobby</p>
      </div>

      <Ticket stubLabel="Admit one">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-varsity text-xs tracking-[0.15em] text-stitch-red uppercase">
            Game code
          </span>
          <span className="headline text-4xl tracking-[0.25em] text-navy">{code}</span>
          <button
            type="button"
            onClick={copyLink}
            className="font-varsity mt-1 rounded-[3px] border-2 border-dashed border-stitch-red px-3 py-1.5 text-xs tracking-[0.1em] text-stitch-red uppercase transition-[colors,transform] duration-100 hover:bg-stitch-red/5 active:scale-[0.98] active:bg-stitch-red/15"
          >
            {copied ? 'Link copied!' : 'Copy invite link'}
          </button>
        </div>
      </Ticket>

      <div className="flex flex-col gap-2">
        <span className="font-varsity text-xs tracking-[0.12em] text-ink-muted uppercase">
          Players ({players.length})
        </span>
        <ul className="flex flex-col gap-1.5">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-[3px] border-[1.5px] border-paper-edge bg-paper-bright px-3 py-2 text-sm"
            >
              <span className="font-medium text-navy">{p.name}</span>
              <span className="flex gap-2">
                {p.id === room.hostId && <StampBadge label="Host" />}
                {p.isCaller && <StampBadge label="Caller" />}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm font-medium text-stitch-red">{error}</p>}

      {isHost ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="font-varsity rounded-[3px] bg-navy px-4 py-3 text-xs tracking-[0.12em] text-paper-bright uppercase transition-[colors,transform] duration-100 hover:bg-navy/90 active:scale-[0.98] active:bg-navy/80 disabled:opacity-60 disabled:active:scale-100"
          >
            {starting ? 'Starting…' : 'Start game'}
          </button>
          {players.length < 2 && (
            <p className="text-center text-xs text-ink-faint">
              No minimum — you can start solo or wait for friends to join.
            </p>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-ink-muted">Waiting for the host to start…</p>
      )}

      <button
        type="button"
        onClick={() => {
          leave();
          navigate('/');
        }}
        className="text-center text-sm text-ink-faint underline decoration-dotted underline-offset-4 hover:text-navy"
      >
        Leave game
      </button>
    </div>
  );
}

function RoomNotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="headline text-2xl text-navy">Game not found</p>
      <p className="text-sm text-ink-muted">
        That code doesn't match a game — it may have expired or been typed wrong.
      </p>
      <Link
        to="/join"
        className="font-varsity rounded-[3px] border-[1.5px] border-navy px-4 py-2.5 text-xs tracking-[0.12em] text-navy uppercase hover:bg-navy/5"
      >
        Try another code
      </Link>
    </div>
  );
}

function CenteredNote({ text }: { text: string }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md items-center justify-center px-4 py-16 text-center text-sm text-ink-muted">
      {text}
    </div>
  );
}
