import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { useRoom } from '../../lib/useRoom';
import { useRoomSession } from '../../lib/useRoomSession';
import { useLiveGameControl } from '../../lib/useLiveGameControl';
import { ALL_EVENTS } from '../../lib/events';
import { GameLayout } from '../../components/GameLayout';
import { RosterPanel } from '../../components/RosterPanel';
import { AnnouncementBanner } from '../../components/AnnouncementBanner';
import { StampBadge } from '../../components/StampBadge';
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
          <div className="flex flex-col gap-3 rounded border-[1.5px] border-navy bg-paper-edge/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Logo size={40} />
              <div>
                <p className="headline text-2xl text-navy sm:text-3xl">Calling</p>
                <p className="font-varsity text-xs tracking-[0.1em] text-ink-muted uppercase">
                  Game {code} · tap a play as it happens
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/glossary"
                className="font-varsity rounded-[3px] px-3 py-2 text-xs tracking-[0.1em] text-ink-muted uppercase transition-colors hover:bg-paper-bright/60"
              >
                Glossary
              </Link>
              <button
                type="button"
                onClick={() => {
                  leave();
                  navigate('/');
                }}
                className="font-varsity rounded-[3px] px-3 py-2 text-xs tracking-[0.1em] text-ink-muted uppercase transition-colors hover:bg-paper-bright/60"
              >
                Leave game
              </button>
            </div>
          </div>
        }
        main={
          <ol className="flex flex-col rounded border-[1.5px] border-navy bg-paper-bright">
            {ALL_EVENTS.map((event, i) => {
              const isCalled = called.has(event.abbr);
              const autoDetected = feed.detectedAbbrs.has(event.abbr);
              return (
                <li
                  key={event.abbr}
                  className={i > 0 ? 'border-t border-dashed border-paper-edge' : ''}
                >
                  <button
                    type="button"
                    onClick={() => callEvent(event.abbr)}
                    aria-pressed={isCalled}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-paper active:bg-paper-edge/40"
                  >
                    <span className="font-varsity w-7 shrink-0 text-right text-xs text-ink-faint">
                      {i + 1}
                    </span>
                    <span className="flex flex-1 items-baseline gap-2">
                      <span className="text-sm font-semibold text-navy">{event.abbr}</span>
                      <span className="text-xs text-ink-muted">{event.label}</span>
                    </span>
                    {isCalled ? (
                      <StampBadge label="Called" />
                    ) : (
                      autoDetected && (
                        <span className="font-varsity text-[9px] tracking-wide text-ink-faint uppercase">
                          Auto
                        </span>
                      )
                    )}
                  </button>
                </li>
              );
            })}
          </ol>
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
    <div className="mx-auto flex min-h-full max-w-md items-center justify-center px-4 py-16 text-center text-sm text-ink-muted">
      {text}
    </div>
  );
}
