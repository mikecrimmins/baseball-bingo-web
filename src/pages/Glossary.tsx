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
          <p className="font-vintage text-3xl text-navy">Glossary</p>
        </div>
        <Link to="/" className="text-sm font-semibold text-navy-dark/60 hover:underline">
          Back
        </Link>
      </div>

      <p className="text-sm text-navy-dark/70">
        What every square on the card means — {ALL_EVENTS.length} plays, plain English.
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a term…"
        className="rounded-lg border-2 border-navy-light/25 bg-white px-3 py-2.5 text-navy-dark outline-none focus:border-gold"
      />

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-navy-dark/60">No terms match "{query}".</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((event) => (
            <li
              key={event.abbr}
              className="flex items-start gap-4 rounded-lg border-2 border-navy-light/20 bg-white p-3.5"
            >
              <span className="font-condensed w-16 shrink-0 text-lg font-semibold text-navy">
                {event.abbr}
              </span>
              <div>
                <p className="text-sm font-semibold text-navy-dark">{event.label}</p>
                {event.description && (
                  <p className="mt-0.5 text-sm text-navy-dark/70">{event.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
