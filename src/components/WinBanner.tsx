type Props = {
  winState: 'bingo' | 'blackout';
  canKeepGoing: boolean;
  onPlayAgain: () => void;
  onKeepGoing: () => void;
};

export function WinBanner({ winState, canKeepGoing, onPlayAgain, onKeepGoing }: Props) {
  const isBlackout = winState === 'blackout';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/60 p-4 backdrop-blur-sm">
      <div className="animate-banner-in w-full max-w-sm rounded-2xl border-4 border-gold-bright bg-gold p-8 text-center shadow-2xl">
        <p className="font-display text-4xl font-bold tracking-wide text-navy-dark sm:text-5xl">
          {isBlackout ? 'BLACKOUT!' : 'BINGO!'}
        </p>
        <p className="mt-2 text-sm font-medium text-navy-dark/80">
          {isBlackout ? 'You marked the whole card.' : 'You got a line — nice call.'}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {canKeepGoing && (
            <button
              type="button"
              onClick={onKeepGoing}
              className="rounded-lg bg-navy px-4 py-3 font-semibold text-white transition-colors hover:bg-navy-light"
            >
              Keep playing for blackout
            </button>
          )}
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-lg border-2 border-navy px-4 py-3 font-semibold text-navy-dark transition-colors hover:bg-navy/10"
          >
            New card
          </button>
        </div>
      </div>
    </div>
  );
}
