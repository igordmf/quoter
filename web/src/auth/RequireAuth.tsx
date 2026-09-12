import { Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '../layout/AppShell.tsx';
import { ROUTES } from '../lib/routes.ts';
import { useAuth } from './AuthContext.tsx';

export function RequireAuth() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={ROUTES.login} replace />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
