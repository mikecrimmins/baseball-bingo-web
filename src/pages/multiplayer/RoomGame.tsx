import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useRoom } from '../../lib/useRoom';
import { useRoomSession } from '../../lib/useRoomSession';
import { useBingoGame } from '../../lib/useBingoGame';
import { BingoCard } from '../../components/BingoCard';
import { GameLayout } from '../../components/GameLayout';
import { RosterPanel } from '../../components/RosterPanel';
import { AnnouncementBanner } from '../../components/AnnouncementBanner';
import { Logo } from '../../components/Logo';

export function RoomGame() {
  const { code } = useParams<{ code: string }>();
  const status = useRoomSession(code);

  if (status === 'checking') return <CenteredNote text="Loading room…" />;
  if (status === 'not-found') return <CenteredNote text="Room not found." />;
  return <RoomGameReady code={code as string} />;
}

function RoomGameReady({ code }: { code: string }) {
  const navigate = useNavigate();
  const { room, me, isCaller, players, calledPending, toggleCell, leave } = useRoom(code);
  const derived = useBingoGame(me?.marked ?? [], me?.size ?? 5);

  if (!room || !me) return <CenteredNote text="Loading room…" />;
  if (room.status === 'waiting') return <Navigate to={`/room/${code}/lobby`} replace />;
  if (isCaller) return <Navigate to={`/room/${code}/caller`} replace />;

  const total = me.size * me.size - 1;

  return (
    <>
      <GameLayout
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Logo size={40} />
              <div>
                <p className="font-vintage text-2xl text-navy sm:text-3xl">Baseball Bingo</p>
                <p className="text-sm text-navy-dark/60">
                  Room {code} · {derived.count}/{total} marked
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                leave();
                navigate('/');
              }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-dark/60 transition-colors hover:bg-navy/5"
            >
              Leave room
            </button>
          </div>
        }
        main={
          <BingoCard
            size={me.size}
            card={me.card}
            marked={me.marked}
            winning={derived.winning}
            called={calledPending}
            onToggle={toggleCell}
          />
        }
        sidebar={<RosterPanel players={players} meId={me.id} hostId={room.hostId} size={me.size} />}
      />
      <AnnouncementBanner players={players} meId={me.id} />
    </>
  );
}

function CenteredNote({ text }: { text: string }) {
  return (
    <div className="mx-auto flex min-h-full max-w-md items-center justify-center px-4 py-16 text-center text-sm text-navy-dark/60">
      {text}
    </div>
  );
}
