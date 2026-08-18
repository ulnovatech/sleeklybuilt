'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type ListViewState = {
  q: string;
  sort: string;
  direction: 'asc' | 'desc';
  density: 'compact' | 'comfortable';
  page: number;
  limit: number;
  filters: Record<string, string>;
};

const reservedKeys = new Set(['q', 'sort', 'direction', 'density', 'view', 'page', 'limit']);

function parsePositiveInt(value: string | null, fallback: number, max?: number) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(max, parsed) : parsed;
}

export function useListView(defaults: Partial<ListViewState> = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const state = useMemo<ListViewState>(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!reservedKeys.has(key)) filters[key] = value;
    });
    return {
      q: searchParams.get('q') ?? defaults.q ?? '',
      sort: searchParams.get('sort') ?? defaults.sort ?? 'updatedAt',
      direction: searchParams.get('direction') === 'asc' ? 'asc' : defaults.direction ?? 'desc',
      density: searchParams.get('density') === 'comfortable' ? 'comfortable' : defaults.density ?? 'compact',
      page: parsePositiveInt(searchParams.get('page'), defaults.page ?? 1),
      limit: parsePositiveInt(searchParams.get('limit'), defaults.limit ?? 20, 100),
      filters,
    };
  }, [defaults.density, defaults.direction, defaults.limit, defaults.page, defaults.q, defaults.sort, searchParams]);

  const update = useCallback((next: Partial<ListViewState> & { resetPage?: boolean }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) next.q ? params.set('q', next.q) : params.delete('q');
    if (next.sort !== undefined) params.set('sort', next.sort);
    if (next.direction !== undefined) params.set('direction', next.direction);
    if (next.density !== undefined) params.set('density', next.density);
    if (next.limit !== undefined) {
      params.set('limit', String(next.limit));
      if (next.page === undefined) params.set('page', '1');
    }
    if (next.page !== undefined) params.set('page', String(Math.max(1, next.page)));
    if (next.filters) {
      Object.entries(next.filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      if (next.page === undefined || next.resetPage !== false) params.set('page', '1');
    }
    if (next.resetPage) params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (state.sort) params.set('sort', state.sort);
    if (state.direction !== 'desc') params.set('direction', state.direction);
    if (state.density !== 'compact') params.set('density', state.density);
    if (state.limit !== 20) params.set('limit', String(state.limit));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, state.density, state.direction, state.limit, state.sort]);

  const toQueryString = useCallback((extra: Record<string, string | undefined> = {}) => {
    const params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.sort) params.set('sort', state.sort);
    if (state.direction) params.set('direction', state.direction);
    params.set('page', String(state.page));
    params.set('limit', String(state.limit));
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    Object.entries(extra).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    return params.toString();
  }, [state.direction, state.filters, state.limit, state.page, state.q, state.sort]);

  return { state, update, clearFilters, toQueryString };
}
