import type { ReactNode } from 'react';

type NoticeKind = 'success' | 'warning' | 'error';

const STYLES: Record<NoticeKind, string> = {
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-900',
  warning: 'border border-amber-200 bg-amber-50 text-amber-900',
  error: 'border border-red-200 bg-red-50 text-red-800',
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
