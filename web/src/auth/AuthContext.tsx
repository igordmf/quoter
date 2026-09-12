import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AUTH_UNAUTHORIZED_EVENT } from '../api/client.ts';
import { clearSession, persistSession, readStoredUser, type SessionUser } from '../api/session.ts';
import { loginRequest } from '../data/backend.ts';

type AuthContextValue = {
  user: SessionUser | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readStoredUser());

  useEffect(() => {
    function onUnauthorized() {
      setUser(null);
    }
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      async login(username: string) {
        const result = await loginRequest(username);
        persistSession(result.token, result.user);
        setUser(result.user);
      },
      logout() {
        clearSession();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
