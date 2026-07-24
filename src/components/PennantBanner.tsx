import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle: string;
  children?: ReactNode;
  onBackdropClick?: () => void;
};

/** Pennant-shaped (pointed both ends) navy banner with paper text — the win/announcement celebration, replacing confetti. */
export function PennantBanner({ title, subtitle, children, onBackdropClick }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm"
      onClick={onBackdropClick}
    >
      <div
        className="animate-banner-in w-full max-w-sm bg-navy px-10 py-12 text-center text-paper-bright"
        style={{
          clipPath:
            'polygon(24px 0, calc(100% - 24px) 0, 100% 50%, calc(100% - 24px) 100%, 24px 100%, 0 50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="headline text-4xl tracking-wide sm:text-5xl">{title}</p>
        <p className="mt-2 text-sm font-medium text-paper-bright/80">{subtitle}</p>
        {children && <div className="mt-6 flex flex-col gap-2">{children}</div>}
      </div>
    </div>
  );
}
