/**
 * Fetch wrapper that automatically logs out user if token is expired (401)
 */
import { clearStoredAuthToken, getStoredAuthToken } from '@/lib/auth-token';

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers ?? {});
  const token = getStoredAuthToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    credentials: options.credentials ?? 'include',
    headers,
  });

  // If token is expired/invalid (401), automatically logout
  if (response.status === 401) {
    clearStoredAuthToken();

    if (typeof window !== 'undefined') {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);

      if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
  }

  return response;
}
