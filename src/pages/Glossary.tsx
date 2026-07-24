import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_EVENTS } from '../lib/events';
import { Logo } from '../components/Logo';

const SORTED = [...ALL_EVENTS].sort((a, b) => a.abbr.localeCompare(b.abbr, undefined, { numeric: true }));

export function Glossary() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SORTED;
    return SORTED.filter(
      (e) =>
        e.abbr.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <p className="headline text-3xl text-navy">Glossary</p>
        </div>
        <Link
          to="/"
          className="text-sm text-ink-faint underline decoration-dotted underline-offset-4 hover:text-navy"
        >
          Back
        </Link>
      </div>

      <p className="text-sm text-ink-muted">
        What every square on the card means — {ALL_EVENTS.length} plays, plain English.
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a term…"
        className="rounded-[3px] border-[1.5px] border-paper-edge bg-paper-bright px-3 py-2.5 text-navy outline-none focus:border-stitch-red"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-ink-muted">No terms match "{query}".</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((event) => (
            <li
              key={event.abbr}
              className="flex items-start gap-4 rounded border-[1.5px] border-navy bg-paper-bright p-3.5"
            >
              <span className="w-16 shrink-0 text-lg font-semibold text-navy">{event.abbr}</span>
              <div>
                <p className="text-sm font-semibold text-navy">{event.label}</p>
                {event.description && (
                  <p className="mt-0.5 text-sm text-ink-muted">{event.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
