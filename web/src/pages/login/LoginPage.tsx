import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/errors.ts';
import { useAuth } from '../../auth/AuthContext.tsx';
import { Notice } from '../../components/Notice.tsx';
import { ThemeToggle } from '../../layout/ThemeToggle.tsx';
import { shellTheme } from '../../layout/shellTheme.ts';
import { isSimulator } from '../../mode.ts';
import { useTheme } from '../../theme/ThemeContext.tsx';

export function LoginPage() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const simulated = isSimulator();
  const colors = shellTheme(simulated, theme === 'dark');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(username.trim());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`${colors.page} items-center justify-center p-6`}>
      <ThemeToggle className={`absolute right-4 top-4 ${colors.iconButton}`} />
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none"
      >
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quoter</h1>
        {simulated ? (
          <p className="mt-2 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-950 dark:bg-amber-900 dark:text-amber-50">
            Simulator mode — any username works
          </p>
        ) : null}
        <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-emerald-600 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          autoComplete="username"
          required
        />
        {error ? (
          <Notice kind="error" className="mt-3">
            {error}
          </Notice>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-lg bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
