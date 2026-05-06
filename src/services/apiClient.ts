import { UserContext } from '../types/buildFeed';

export async function apiRequest<T>(path: string, options: RequestInit & { user?: UserContext | null } = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (options.user) {
    headers.set('X-User-Id', options.user.id);
    headers.set('X-User-Role', options.user.role);
  }
  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API request failed: ${response.status}`);
  }
  return response.json();
}

export const pollingIntervalMs = 10000;
