import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from './useRoom';

export type SessionStatus = 'checking' | 'ready' | 'not-found';

/**
 * Guards the room-scoped pages (lobby, game, caller): on mount, checks
 * whether this browser already has a player row in the room (a refresh, or
 * navigating back). If so, the page can render immediately. If the room
 * exists but this browser hasn't joined, redirect to the join form. If the
 * code doesn't match any room, the page shows a "not found" state itself.
 */
export function useRoomSession(code: string | undefined): SessionStatus {
  const navigate = useNavigate();
  const { resume } = useRoom(null);
  const [status, setStatus] = useState<SessionStatus>('checking');

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setStatus('checking');
    resume(code).then((result) => {
      if (cancelled) return;
      if (result === 'restored') setStatus('ready');
      else if (result === 'not-joined') navigate(`/join/${code}`, { replace: true });
      else setStatus('not-found');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return status;
}
