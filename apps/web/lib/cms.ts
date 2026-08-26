const CMS_BASE = process.env.NEXT_PUBLIC_CMS_URL ?? 'http://localhost:3002';

export async function cmsFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${CMS_BASE}${path}`, { ...init, cache: 'no-store' });
  if (!res.ok) throw new Error(`CMS ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}
