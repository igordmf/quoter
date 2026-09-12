import { STORAGE_KEYS } from '../lib/storageKeys.ts';

export type SessionUser = {
  id: string;
  name: string;
  spread: string;
};

export function getToken() {
  return localStorage.getItem(STORAGE_KEYS.token);
}

export function readStoredUser(): SessionUser | null {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function persistSession(token: string, user: SessionUser) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}
