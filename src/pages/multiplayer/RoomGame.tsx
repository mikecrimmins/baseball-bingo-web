import { useMemo } from 'react';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useRoom } from '../../lib/useRoom';
import { useRoomSession } from '../../lib/useRoomSession';
import { useBingoGame } from '../../lib/useBingoGame';
import { useLiveGameControl } from '../../lib/useLiveGameControl';
import { BingoCard } from '../../components/BingoCard';
import { GameLayout } from '../../components/GameLayout';
import { RosterPanel } from '../../components/RosterPanel';
import { AnnouncementBanner } from '../../components/AnnouncementBanner';
import { Logo } from '../../components/Logo';

export function RoomGame() {
  const { code } = useParams<{ code: string }>();
  const status = useRoomSession(code);

  if (status === 'checking') return <CenteredNote text="Loading game…" />;
  if (status === 'not-found') return <CenteredNote text="Game not found." />;
  return <RoomGameReady code={code as string} />;
}

function RoomGameReady({ code }: { code: string }) {
  const navigate = useNavigate();
  const { room, me, isHost, isCaller, players, calledPending, toggleCell, leave, followGame, unfollowGame } =
    useRoom(code);
  const derived = useBingoGame(me?.marked ?? [], me?.size ?? 5);
  const { element: liveGameSection, feed } = useLiveGameControl({
    isHost,
    mlbGamePk: room?.mlbGamePk ?? null,
    mlbGameLabel: room?.mlbGameLabel ?? null,
    onFollow: followGame,
    onUnfollow: unfollowGame,
  });

  const detectedPending = useMemo(() => {
    if (!me) return new Set<number>();
    const pending = new Set<number>(calledPending);
    me.card.forEach((event, i) => {
      if (!event.free && feed.detectedAbbrs.has(event.abbr) && !me.marked[i]) pending.add(i);
    });
    return pending;
  }, [me, calledPending, feed.detectedAbbrs]);

  if (!room || !me) return <CenteredNote text="Loading game…" />;
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
                  Game {code} · {derived.count}/{total} marked
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/glossary"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-dark/60 transition-colors hover:bg-navy/5"
              >
                Glossary
              </Link>
              <button
                type="button"
                onClick={() => {
                  leave();
                  navigate('/');
                }}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-dark/60 transition-colors hover:bg-navy/5"
              >
                Leave game
              </button>
            </div>
          </div>
        }
        main={
          <BingoCard
            size={me.size}
            card={me.card}
            marked={me.marked}
            winning={derived.winning}
            called={detectedPending}
            onToggle={toggleCell}
          />
        }
        sidebar={
          <div className="flex flex-col gap-4">
            <RosterPanel players={players} meId={me.id} hostId={room.hostId} size={me.size} />
            {liveGameSection}
          </div>
        }
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
