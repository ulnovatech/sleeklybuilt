'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

type QueryState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
};

export function useApiQuery<T>(path: string | null, options?: { intervalMs?: number }): QueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(path));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!path) return;
    setIsRefreshing(true);
    setError(null);
    try {
      const next = await api<T>(path);
      if (mounted.current) setData(next);
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason : new Error('Request failed'));
    } finally {
      if (mounted.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [path]);

  useEffect(() => {
    mounted.current = true;
    setIsLoading(Boolean(path));
    void refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh, path]);

  useEffect(() => {
    if (!options?.intervalMs || !path) return;
    const id = window.setInterval(() => void refresh(), options.intervalMs);
    return () => window.clearInterval(id);
  }, [options?.intervalMs, path, refresh]);

  return { data, error, isLoading, isRefreshing, refresh };
}

export function useApiMutation<TResponse, TBody = undefined>(path: string, method: 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'POST') {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (body?: TBody) => {
    setIsPending(true);
    setError(null);
    try {
      return await api<TResponse>(path, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (reason) {
      const normalized = reason instanceof Error ? reason : new Error('Request failed');
      setError(normalized);
      throw normalized;
    } finally {
      setIsPending(false);
    }
  }, [method, path]);

  return { mutate, isPending, error };
}
