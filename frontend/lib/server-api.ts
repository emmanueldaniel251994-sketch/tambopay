import 'server-only';

export function backendUrl(path: string): string {
  const origin = process.env.TAMBOPAY_API_URL;
  if (!origin) throw new Error('TAMBOPAY_API_URL is not configured');
  const url = new URL(path, origin);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid backend URL');
  return url.toString();
}

export async function backendFetch(path: string, init: RequestInit = {}) {
  return fetch(backendUrl(path), { ...init, cache: 'no-store', signal: AbortSignal.timeout(10000) });
}
