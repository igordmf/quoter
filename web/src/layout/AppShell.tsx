import { IconCurrencyDollar } from '@tabler/icons-react';
import { History, LogOut, Repeat, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext.tsx';
import { ROUTES } from '../lib/routes.ts';
import { isSimulator } from '../mode.ts';
import { RailNavLink } from './RailNavLink.tsx';
import { shellTheme } from './shellTheme.ts';

const NAV_ITEMS = [
  { to: ROUTES.quote, label: 'Quote', icon: Repeat },
  { to: ROUTES.history, label: 'History', icon: History },
] as const;

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  const { user, logout } = useAuth();
  const simulated = isSimulator();
  const theme = shellTheme(simulated);

  return (
    <div className={theme.page}>
      {simulated ? (
        <div className="absolute left-16 right-0 top-0 z-10 bg-amber-500 px-4 py-1 text-center text-xs font-semibold text-amber-950">
          Simulator mode — JSON prices, no API, history in this browser
        </div>
      ) : null}
      <aside className={theme.aside}>
        <div className={theme.logo} title="Quoter">
          <IconCurrencyDollar className="h-6 w-6" />
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <RailNavLink
              key={item.to}
              to={item.to}
              label={item.label}
              activeClass={theme.navActive}
              idleClass={theme.navIdle}
            >
              <item.icon className="h-5 w-5" />
            </RailNavLink>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            title={user?.name ?? 'User'}
          >
            <UserRound className="h-5 w-5" />
          </div>
          <span className="max-w-[3.5rem] truncate text-center text-[10px] text-slate-500">
            {user?.name}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>
      <main className={theme.main}>{children}</main>
    </div>
  );
}
