'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Input, StatusBadge } from '@/components/ui/primitives';
import { api } from '@/lib/api';

export type PickedBusiness = { id: string; name: string; subtitle: string };

type SearchResponse = {
  groups: Array<{
    type: 'leads' | 'businesses' | 'runs' | 'demand';
    items: Array<{ id: string; title: string; subtitle: string }>;
  }>;
  message?: string;
};

/**
 * Type-ahead picker over already-discovered businesses. Backed by the operational
 * search API so operators never need to paste an internal identifier.
 */
export function BusinessPicker({
  value,
  onChange,
  label = 'Match to an existing business',
  placeholder = 'Search discovered businesses…',
  disabled,
}: {
  value: PickedBusiness | null;
  onChange: (business: PickedBusiness | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PickedBusiness[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const term = query.trim();
    if (value) return;
    if (term.length < 2) {
      setResults([]);
      setHint(term.length === 0 ? null : 'Type at least 2 characters.');
      setError(null);
      return;
    }

    const currentRequest = ++requestId.current;
    const timer = setTimeout(() => {
      setSearching(true);
      setError(null);
      api<SearchResponse>(`/api/search?q=${encodeURIComponent(term)}`)
        .then((data) => {
          if (currentRequest !== requestId.current) return;
          const group = data.groups.find((entry) => entry.type === 'businesses');
          const items = (group?.items ?? []).map((item) => ({
            id: item.id,
            name: item.title,
            subtitle: item.subtitle,
          }));
          setResults(items);
          setHint(items.length === 0 ? 'No discovered business matches this search.' : null);
        })
        .catch((reason) => {
          if (currentRequest !== requestId.current) return;
          setError(reason instanceof Error ? reason.message : 'Business search failed');
          setResults([]);
        })
        .finally(() => {
          if (currentRequest === requestId.current) setSearching(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, value]);

  if (value) {
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        <div className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface-raised px-2.5 py-1.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{value.name}</p>
            <p className="truncate text-xs text-ink-muted">{value.subtitle}</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={() => {
              onChange(null);
              setQuery('');
              setResults([]);
            }}
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-ink-muted">
        {label}
        <Input
          className="mt-1"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {searching && <p className="text-xs text-ink-muted">Searching businesses…</p>}
      {error && (
        <p className="text-xs text-danger-foreground" role="alert">
          {error}
        </p>
      )}
      {!searching && !error && hint && <p className="text-xs text-ink-faint">{hint}</p>}
      {results.length > 0 && (
        <ul className="max-h-48 divide-y divide-line overflow-y-auto rounded-md border border-line bg-surface">
          {results.map((business) => (
            <li key={business.id}>
              <button
                type="button"
                disabled={disabled}
                className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-surface-raised focus:bg-surface-raised focus:outline-none disabled:opacity-50"
                onClick={() => {
                  onChange(business);
                  setResults([]);
                }}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm text-ink">{business.name}</span>
                  <span className="block truncate text-xs text-ink-muted">{business.subtitle}</span>
                </span>
                <StatusBadge tone="neutral">Select</StatusBadge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
