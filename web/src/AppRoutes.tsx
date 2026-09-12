import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext.tsx';
import { RequireAuth } from './auth/RequireAuth.tsx';
import { ROUTES } from './lib/routes.ts';
import { HistoryPage } from './pages/history/HistoryPage.tsx';
import { LoginPage } from './pages/login/LoginPage.tsx';
import { QuotePage } from './pages/quote/QuotePage.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<GuestRoute />} />
      <Route element={<RequireAuth />}>
        <Route path={ROUTES.quote} element={<QuotePage />} />
        <Route path={ROUTES.history} element={<HistoryPage />} />
      </Route>
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
}

function GuestRoute() {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={ROUTES.quote} replace />;
  }
  return <LoginPage />;
}

function CatchAll() {
  const { user } = useAuth();
  return <Navigate to={user ? ROUTES.quote : ROUTES.login} replace />;
}
