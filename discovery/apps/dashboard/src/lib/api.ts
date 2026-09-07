export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    const err = data?.error;
    const message =
      typeof err === 'string' ? err : err?.message ?? JSON.stringify(err) ?? 'Request failed';
    throw new Error(message);
  }
  return data as T;
}
