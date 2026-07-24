import type { ReactNode } from 'react';

type Props = {
  /** Rotation direction at rest (desktop only — drops to 0 on the stacked mobile layout). */
  tilt?: -1 | 0 | 1;
  /** Renders as a clickable button: straightens + lifts 2px on hover. */
  interactive?: boolean;
  onClick?: () => void;
  /** The perforated "stub" strip text (e.g. "ADMIT ONE"). Omit to skip the strip entirely. */
  stubLabel?: string;
  className?: string;
  children: ReactNode;
};

/**
 * The signature ticket-stub surface: paper-bright, hard navy border, 4px
 * radius, hard offset "print misregistration" shadow instead of a soft drop
 * shadow, and an optional perforated stub strip.
 */
export function Ticket({ tilt = 0, interactive, onClick, stubLabel, className = '', children }: Props) {
  const tiltClass = tilt === -1 ? 'sm:rotate-[-1deg]' : tilt === 1 ? 'sm:rotate-[1deg]' : '';
  const Comp = interactive ? 'button' : 'div';

  return (
    <Comp
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={[
        'ticket-shadow flex overflow-hidden rounded border-[1.5px] border-navy bg-paper-bright text-left',
        'transition-transform duration-150 motion-reduce:transition-none',
        tiltClass,
        interactive ? 'cursor-pointer hover:-translate-y-0.5 hover:rotate-0' : '',
        className,
      ].join(' ')}
    >
      {stubLabel && (
        <div className="flex w-9 shrink-0 items-center justify-center border-r-2 border-dashed border-paper-edge bg-paper">
          <span
            className="font-varsity text-[10px] tracking-[0.15em] text-ink-faint uppercase"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {stubLabel}
          </span>
        </div>
      )}
      <div className="flex-1 p-4">{children}</div>
    </Comp>
  );
}
