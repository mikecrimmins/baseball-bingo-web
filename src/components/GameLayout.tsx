import type { ReactNode } from 'react';

type Props = {
  header: ReactNode;
  main: ReactNode;
  /** Reserved right-hand region for the live event feed (Milestone 3). Omit to hide it entirely. */
  sidebar?: ReactNode;
};

/**
 * Shared game-screen shell: header bar, card as the hero, and a right-hand
 * sidebar column reserved for the live event feed. On phones everything
 * stacks into a single column.
 */
export function GameLayout({ header, main, sidebar }: Props) {
  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {header}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1">{main}</div>
        {sidebar && <aside className="w-full shrink-0 lg:w-80">{sidebar}</aside>}
      </div>
    </div>
  );
}
