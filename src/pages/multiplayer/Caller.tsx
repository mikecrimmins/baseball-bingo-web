import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useRoom } from '../../lib/useRoom';
import { useRoomSession } from '../../lib/useRoomSession';
import { useLiveGameControl } from '../../lib/useLiveGameControl';
import { ALL_EVENTS } from '../../lib/events';
import { GameLayout } from '../../components/GameLayout';
import { RosterPanel } from '../../components/RosterPanel';
import { AnnouncementBanner } from '../../components/AnnouncementBanner';
import { Logo } from '../../components/Logo';

export function Caller() {
  const { code } = useParams<{ code: string }>();
  const status = useRoomSession(code);

  if (status === 'checking') return <CenteredNote text="Loading game…" />;
  if (status === 'not-found') return <CenteredNote text="Game not found." />;
  return <CallerReady code={code as string} />;
}

function CallerReady({ code }: { code: string }) {
  const navigate = useNavigate();
  const { room, me, isHost, isCaller, players, callEvent, leave, followGame, unfollowGame } =
    useRoom(code);
  const { element: liveGameSection, feed } = useLiveGameControl({
    isHost,
    mlbGamePk: room?.mlbGamePk ?? null,
    mlbGameLabel: room?.mlbGameLabel ?? null,
    onFollow: followGame,
    onUnfollow: unfollowGame,
  });

  if (!room || !me) return <CenteredNote text="Loading game…" />;
  if (room.status === 'waiting') return <Navigate to={`/room/${code}/lobby`} replace />;
  if (!isCaller) return <Navigate to={`/room/${code}/play`} replace />;

  const called = new Set(room.calledEvents);

  return (
    <>
      <GameLayout
        header={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Logo size={40} />
              <div>
                <p className="font-vintage text-2xl text-navy sm:text-3xl">Calling</p>
                <p className="text-sm text-navy-dark/60">
                  Game {code} · tap a play as it happens
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
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALL_EVENTS.map((event) => {
              const isCalled = called.has(event.abbr);
              const autoDetected = feed.detectedAbbrs.has(event.abbr);
              return (
                <button
                  key={event.abbr}
                  type="button"
                  onClick={() => callEvent(event.abbr)}
                  aria-pressed={isCalled}
                  className={[
                    'relative flex flex-col items-start gap-0.5 rounded-lg border-2 px-3 py-2.5 text-left transition-colors',
                    isCalled
                      ? 'border-gold-bright bg-gold text-navy-dark'
                      : autoDetected
                        ? 'border-navy-light/40 border-dashed bg-navy/5 text-navy-dark'
                        : 'border-navy-light/25 bg-white text-navy-dark hover:bg-navy/5',
                  ].join(' ')}
                >
                  <span className="font-condensed text-sm font-semibold">{event.abbr}</span>
                  <span className="text-xs opacity-70">{event.label}</span>
                  {!isCalled && autoDetected && (
                    <span className="absolute top-1 right-1 text-[8px] font-bold tracking-wide text-navy-dark/50 uppercase">
                      auto
                    </span>
                  )}
                </button>
              );
            })}
          </div>
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
