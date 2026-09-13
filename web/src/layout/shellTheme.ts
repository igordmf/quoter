export type ShellTheme = {
  page: string;
  aside: string;
  logo: string;
  main: string;
  navActive: string;
  navIdle: string;
  avatar: string;
  userName: string;
  iconButton: string;
  banner: string;
};

export function shellTheme(simulated: boolean, dark: boolean): ShellTheme {
  if (simulated && dark) {
    return {
      page: 'relative flex min-h-screen bg-amber-950 text-amber-50',
      aside: 'flex w-16 flex-col items-center border-r border-amber-900 bg-amber-950 py-4',
      logo: 'mb-6 text-amber-300',
      main: 'flex-1 p-8 pt-12',
      navActive: 'bg-amber-900 text-amber-100',
      navIdle: 'text-amber-200/80 hover:bg-amber-900/70',
      avatar: 'flex h-10 w-10 items-center justify-center rounded-full bg-amber-900 text-amber-100',
      userName: 'max-w-[3.5rem] truncate text-center text-[10px] text-amber-200/80',
      iconButton: 'rounded-lg p-2 text-amber-200 hover:bg-amber-900 hover:text-amber-50',
      banner:
        'absolute left-16 right-0 top-0 z-10 bg-amber-800 px-4 py-1 text-center text-xs font-semibold text-amber-50',
    };
  }

  if (simulated) {
    return {
      page: 'relative flex min-h-screen bg-amber-50 text-slate-800',
      aside: 'flex w-16 flex-col items-center border-r border-amber-200 bg-amber-100 py-4',
      logo: 'mb-6 text-amber-800',
      main: 'flex-1 p-8 pt-12',
      navActive: 'bg-amber-200 text-amber-900',
      navIdle: 'text-slate-500 hover:bg-slate-100',
      avatar: 'flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600',
      userName: 'max-w-[3.5rem] truncate text-center text-[10px] text-slate-500',
      iconButton: 'rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800',
      banner:
        'absolute left-16 right-0 top-0 z-10 bg-amber-500 px-4 py-1 text-center text-xs font-semibold text-amber-950',
    };
  }

  if (dark) {
    return {
      page: 'relative flex min-h-screen bg-slate-950 text-slate-100',
      aside: 'flex w-16 flex-col items-center border-r border-slate-800 bg-slate-900 py-4',
      logo: 'mb-6 text-emerald-400',
      main: 'flex-1 p-8',
      navActive: 'bg-emerald-950 text-emerald-300',
      navIdle: 'text-slate-400 hover:bg-slate-800',
      avatar: 'flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300',
      userName: 'max-w-[3.5rem] truncate text-center text-[10px] text-slate-400',
      iconButton: 'rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100',
      banner: '',
    };
  }

  return {
    page: 'relative flex min-h-screen bg-slate-50 text-slate-800',
    aside: 'flex w-16 flex-col items-center border-r border-slate-200 bg-white py-4',
    logo: 'mb-6 text-emerald-700',
    main: 'flex-1 p-8',
    navActive: 'bg-emerald-50 text-emerald-700',
    navIdle: 'text-slate-500 hover:bg-slate-100',
    avatar: 'flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600',
    userName: 'max-w-[3.5rem] truncate text-center text-[10px] text-slate-500',
    iconButton: 'rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    banner: '',
  };
}
