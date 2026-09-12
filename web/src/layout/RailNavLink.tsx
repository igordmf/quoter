import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

export function RailNavLink({
  to,
  label,
  activeClass,
  idleClass,
  children,
}: {
  to: string;
  label: string;
  activeClass: string;
  idleClass: string;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      title={label}
      className={({ isActive }) => `rounded-lg p-2 ${isActive ? activeClass : idleClass}`}
    >
      {children}
    </NavLink>
  );
}
