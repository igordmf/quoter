import { ApiError } from './errors.ts';
import { clearSession, getToken } from './session.ts';

const FETCH_TIMEOUT_MS = 8_000;

export const AUTH_UNAUTHORIZED_EVENT = 'quoter:unauthorized';

export function getApiBase() {
  return import.meta.env.VITE_API_URL ?? '/api';
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError');
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${getApiBase()}${path}`, { ...init, headers, signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError(0, 'timeout', 'The server took too long to respond. Please try again.');
    }
    throw new ApiError(0, 'network_error', 'Could not reach the server. Check that the API is running.');
  }

  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    const body = data as { code?: string; message?: string };
    throw new ApiError(
      response.status,
      body.code ?? 'request_failed',
      body.message ?? 'Request failed. Please try again.',
    );
  }
  return data as T;
}
