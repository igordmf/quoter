import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/errors.ts';
import { useAuth } from '../../auth/AuthContext.tsx';
import { Notice } from '../../components/Notice.tsx';
import { isSimulator } from '../../mode.ts';

export function LoginPage() {
  const { login } = useAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-slate-900">Quoter</h1>
        {isSimulator() ? (
          <p className="mt-2 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-950">
            Simulator mode — any username works
          </p>
        ) : null}
        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-emerald-600"
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
