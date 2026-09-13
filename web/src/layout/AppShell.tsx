import { IconCurrencyDollar } from '@tabler/icons-react';
import { History, LogOut, Repeat, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext.tsx';
import { ROUTES } from '../lib/routes.ts';
import { isSimulator } from '../mode.ts';
import { useTheme } from '../theme/ThemeContext.tsx';
import { RailNavLink } from './RailNavLink.tsx';
import { ThemeToggle } from './ThemeToggle.tsx';
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
  const { theme } = useTheme();
  const simulated = isSimulator();
  const colors = shellTheme(simulated, theme === 'dark');

  return (
    <div className={colors.page}>
      {simulated ? (
        <div className={colors.banner}>
          Simulator mode — JSON prices, no API, history in this browser
        </div>
      ) : null}
      <aside className={colors.aside}>
        <div className={colors.logo} title="Quoter">
          <IconCurrencyDollar className="h-6 w-6" />
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <RailNavLink
              key={item.to}
              to={item.to}
              label={item.label}
              activeClass={colors.navActive}
              idleClass={colors.navIdle}
            >
              <item.icon className="h-5 w-5" />
            </RailNavLink>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-2">
          <ThemeToggle className={colors.iconButton} />
          <div className={colors.avatar} title={user?.name ?? 'User'}>
            <UserRound className="h-5 w-5" />
          </div>
          <span className={colors.userName}>{user?.name}</span>
          <button
            type="button"
            onClick={logout}
            className={colors.iconButton}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>
      <main className={colors.main}>{children}</main>
    </div>
  );
}
