'use client';

import { useState, useTransition } from 'react';
import { loginAdmin } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-nabams-gold" aria-hidden />
        <h2 className="text-lg font-bold text-white">Administrator Login</h2>
      </div>
      <Input id="email" name="email" label="Admin Email" type="email" placeholder="hod@polytechnicibadan.edu.ng" required autoComplete="email" />
      <Input id="password" name="password" label="Password" type="password" placeholder="••••••••" required autoComplete="current-password" />
      {error && (
        <div className="rounded-xl border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      <Button type="submit" fullWidth size="lg" loading={isPending}>
        {isPending ? 'Authenticating…' : 'Login'}
      </Button>
      <p className="text-center text-xs text-gray-500 mt-2">Sessions expire after 1 hour. Student voters use a separate login.</p>
    </form>
  );
}
