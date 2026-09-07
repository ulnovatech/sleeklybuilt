import React, { useEffect, useState } from 'react';

export default function Filters({ onChange, initial = {} }) {
  const [qInput, setQInput] = useState(initial.q || '');
  const [state, setState] = useState({
    q: initial.q || '',
    status: initial.status || '',
    has_website: initial.has_website ?? '',
    location: initial.location || '',
    industry: initial.industry || '',
    sort: initial.sort || 'created_at',
    dir: initial.dir || 'desc',
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setState((prev) => (prev.q === qInput ? prev : { ...prev, q: qInput }));
    }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    onChange?.(state);
    // Parent passes inline onChange; intentional sync on state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function update(k, v) {
    setState((prev) => ({ ...prev, [k]: v }));
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2 p-2 text-sm shadow">
      <label className="sr-only" htmlFor="company-filter-q">
        Search companies
      </label>
      <input
        id="company-filter-q"
        className="min-h-11 bg-blue-950 px-2 py-2"
        placeholder="Search name or notes"
        value={qInput}
        onChange={(e) => setQInput(e.target.value)}
      />
      <label className="sr-only" htmlFor="company-filter-status">
        Status
      </label>
      <select
        id="company-filter-status"
        className="min-h-11 bg-blue-950 px-2 py-2"
        value={state.status}
        onChange={(e) => update('status', e.target.value)}
        aria-label="Status"
      >
        <option value="">All status</option>
        {['not_contacted', 'contacted', 'interested', 'in_negotiation', 'rejected', 'closed_won', 'closed_lost'].map(
          (s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ),
        )}
      </select>
      <select
        className="min-h-11 bg-blue-950 px-2 py-2"
        value={state.has_website}
        onChange={(e) => update('has_website', e.target.value)}
        aria-label="Has website"
      >
        <option value="">Website?</option>
        <option value="1">Has site</option>
        <option value="0">No site</option>
      </select>
      <input
        className="min-h-11 bg-blue-950 px-2 py-2"
        placeholder="Location"
        aria-label="Location"
        value={state.location}
        onChange={(e) => update('location', e.target.value)}
      />
      <input
        className="min-h-11 bg-blue-950 px-2 py-2"
        placeholder="Industry"
        aria-label="Industry"
        value={state.industry}
        onChange={(e) => update('industry', e.target.value)}
      />
      <select
        className="min-h-11 bg-blue-950 px-2 py-2"
        value={state.sort}
        onChange={(e) => update('sort', e.target.value)}
        aria-label="Sort field"
      >
        {['created_at', 'name', 'status', 'location', 'last_contact_date'].map((s) => (
          <option key={s} value={s}>
            Sort: {s}
          </option>
        ))}
      </select>
      <select
        className="min-h-11 bg-blue-950 px-2 py-2"
        value={state.dir}
        onChange={(e) => update('dir', e.target.value)}
        aria-label="Sort direction"
      >
        <option value="desc">Desc</option>
        <option value="asc">Asc</option>
      </select>
    </div>
  );
}
