export function shellTheme(simulated: boolean) {
  if (simulated) {
    return {
      page: 'relative flex min-h-screen bg-amber-50 text-slate-800',
      aside: 'flex w-16 flex-col items-center border-r border-amber-200 bg-amber-100 py-4',
      logo: 'mb-6 text-amber-800',
      main: 'flex-1 p-8 pt-12',
      navActive: 'bg-amber-200 text-amber-900',
      navIdle: 'text-slate-500 hover:bg-slate-100',
    };
  }
  return {
    page: 'relative flex min-h-screen bg-slate-50 text-slate-800',
    aside: 'flex w-16 flex-col items-center border-r border-slate-200 bg-white py-4',
    logo: 'mb-6 text-emerald-700',
    main: 'flex-1 p-8',
    navActive: 'bg-emerald-50 text-emerald-700',
    navIdle: 'text-slate-500 hover:bg-slate-100',
  };
}
