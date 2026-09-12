'use client';

import { useState, useTransition } from 'react';
import { loginVoter } from './actions/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export function LoginForm() {
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginVoter(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-nabams-gold" aria-hidden />
          <h2 className="text-lg font-bold text-white">Voter Accreditation</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="matric_number"
            name="matric_number"
            label="Matriculation Number"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{13}"
            maxLength={13}
            placeholder="e.g. 2025231010270"
            hint="13-digit number printed on your ID card"
            required
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300" htmlFor="voting_pin">
              Voting PIN
            </label>
            <div className="relative">
              <input
                id="voting_pin"
                name="voting_pin"
                type={showPin ? 'text' : 'password'}
                placeholder="Enter your voting PIN"
                required
                autoComplete="off"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nabams-green transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPin((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isPending}
            disabled={isPending}
          >
            {isPending ? 'Verifying...' : 'Access My Ballot'}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          Having trouble? Contact the Electoral Officer at the accreditation desk.
        </p>
      </div>
    </div>
  );
}
