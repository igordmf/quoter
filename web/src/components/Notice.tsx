import type { ReactNode } from 'react';

type NoticeKind = 'success' | 'warning' | 'error';

const STYLES: Record<NoticeKind, string> = {
  success:
    'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
  warning:
    'border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
  error:
    'border border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
};

export function Notice({
  kind,
  className = '',
  children,
}: {
  kind: NoticeKind;
  className?: string;
  children: ReactNode;
}) {
  return <p className={`rounded-lg px-3 py-2 text-sm ${STYLES[kind]} ${className}`}>{children}</p>;
}
