// Session helpers (#55): keep users signed in by refreshing the 15-minute access token.
// - authFetch(): fetch with the access token; on 401 it refreshes once and retries.
// - refreshSession(): exchanges the stored refresh token for a new access token (deduplicated).
// - msUntilExpiry(): reads the JWT expiry so the SessionKeeper can refresh proactively.
// Author: Ryan Naidji
import { API_URL } from './apiUrl';

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

let refreshing: Promise<string | null> | null = null;

/** Get a new access token. Concurrent callers share the same request. Returns null on failure. */
export function refreshSession(): Promise<string | null> {
  if (refreshing) return refreshing;
  const refreshToken = read('tm_refresh');
  if (!refreshToken) return Promise.resolve(null);
  refreshing = fetch(`${API_URL}/api/v1/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
      if (!data.accessToken) return null;
      try {
        localStorage.setItem('tm_token', data.accessToken);
        if (data.refreshToken) localStorage.setItem('tm_refresh', data.refreshToken);
      } catch {
        /* storage unavailable */
      }
      return data.accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/** Milliseconds until the stored access token expires (negative if expired, null if unknown). */
export function msUntilExpiry(): number | null {
  const token = read('tm_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return payload.exp ? payload.exp * 1000 - Date.now() : null;
  } catch {
    return null;
  }
}

/** Clear the local session and send the user to the session-expired page. */
export function endSession() {
  try {
    ['tm_token', 'tm_refresh', 'tm_user'].forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable */
  }
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/session-expired')) {
    window.location.assign('/session-expired');
  }
}

/** fetch() against the API with the access token; refreshes and retries once on 401. */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const withToken = (token: string | null): RequestInit => ({
    ...init,
    headers: { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  let res = await fetch(url, withToken(read('tm_token')));
  if (res.status === 401) {
    const token = await refreshSession();
    if (!token) {
      endSession();
      return res;
    }
    res = await fetch(url, withToken(token));
  }
  return res;
}
