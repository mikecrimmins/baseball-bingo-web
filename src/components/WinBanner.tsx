import { PennantBanner } from './PennantBanner';

type Props = {
  winState: 'bingo' | 'blackout';
  canKeepGoing: boolean;
  onPlayAgain: () => void;
  onKeepGoing: () => void;
};

export function WinBanner({ winState, canKeepGoing, onPlayAgain, onKeepGoing }: Props) {
  const isBlackout = winState === 'blackout';

  return (
    <PennantBanner
      title={isBlackout ? 'Blackout!' : 'Bingo!'}
      subtitle={isBlackout ? 'You marked the whole card.' : 'You got a line — nice call.'}
    >
      {canKeepGoing && (
        <button
          type="button"
          onClick={onKeepGoing}
          className="font-varsity rounded-[3px] bg-paper-bright px-4 py-3 text-xs tracking-[0.1em] text-navy uppercase transition-colors hover:bg-paper"
        >
          Keep playing for blackout
        </button>
      )}
      <button
        type="button"
        onClick={onPlayAgain}
        className="font-varsity rounded-[3px] border-[1.5px] border-paper-bright px-4 py-3 text-xs tracking-[0.1em] text-paper-bright uppercase transition-colors hover:bg-paper-bright/10"
      >
        New card
      </button>
    </PennantBanner>
  );
}
