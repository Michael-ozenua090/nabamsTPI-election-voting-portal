'use client';

import { useState, useTransition } from 'react';
import { loginAdmin } from '@/app/actions/admin';
import { Input } from '@/components/ui/Input';
import { Shield, Loader2 } from 'lucide-react';

export default function AdminLoginForm() {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const result = await loginAdmin(fd);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          window.location.href = '/admin';
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-2 flex items-center gap-2">
        <Shield className="h-5 w-5 text-sky-600" aria-hidden />
        <h2 className="text-lg font-bold text-slate-900">Administrator Login</h2>
      </div>

      <Input
        id="email"
        name="email"
        label="Admin Email"
        type="email"
        placeholder="hod@polytechnicibadan.edu.ng"
        required
        autoComplete="email"
      />
      <Input
        id="password"
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-medium rounded-lg shadow-sm transition duration-150 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Authenticating…
          </>
        ) : 'Login'}
      </button>

      <p className="text-center text-xs text-slate-400 mt-2">
        Sessions expire after 1 hour. Student voters use a separate login.
      </p>
    </form>
  );
}
