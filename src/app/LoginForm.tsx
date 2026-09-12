'use client';

import { useState, useTransition } from 'react';
import { checkVoterStatus, loginVoterWithPin } from './actions/auth';
import { Eye, EyeOff, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';

export function LoginForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      if (step === 1) {
        const result = await checkVoterStatus(fd);
        if (result?.error) {
          setError(result.error);
        } else if (result?.needsPin) {
          setStep(2);
        }
      } else {
        const result = await loginVoterWithPin(fd);
        if (result?.error) {
          setError(result.error);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-1">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
        <div className={`flex-1 h-px ${step >= 2 ? 'bg-sky-600' : 'bg-slate-200'}`} />
        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
      </div>
      <p className="text-xs text-slate-500 -mt-2">
        {step === 1 ? 'Step 1: Verify your identity' : 'Step 2: Enter your Voting PIN'}
      </p>

      {/* Matric Number */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="matric_number" className="text-sm font-medium text-slate-700">
          Matriculation Number
        </label>
        <input
          id="matric_number"
          name="matric_number"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{13}"
          maxLength={13}
          placeholder="e.g. 2025231010270"
          required
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          readOnly={step === 2}
          className={[
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500',
            'transition duration-150 ease-in-out',
            step === 2
              ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500'
              : 'bg-white border-slate-300',
          ].filter(Boolean).join(' ')}
        />
        {step === 1 && (
          <p className="text-xs text-slate-400">13-digit number printed on your student ID card</p>
        )}
      </div>

      {/* PIN field — step 2 only */}
      {step === 2 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="voting_pin" className="text-sm font-medium text-slate-700">
            Voting PIN
          </label>
          <div className="relative">
            <input
              id="voting_pin"
              name="voting_pin"
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={4}
              placeholder="Enter your 4-digit PIN"
              required
              autoComplete="off"
              autoFocus
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150"
            />
            <button
              type="button"
              onClick={() => setShowPin((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-medium rounded-lg shadow-sm transition duration-150 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 text-sm"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying…
          </>
        ) : step === 1 ? (
          <>
            Verify Matric Number
            <ChevronRight className="h-4 w-4" />
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Access My Ballot
          </>
        )}
      </button>

      {step === 2 && (
        <button
          type="button"
          onClick={() => { setStep(1); setError(''); }}
          className="w-full text-center text-xs text-sky-600 hover:text-sky-800 hover:underline transition-colors"
        >
          ← Change Matric Number
        </button>
      )}

      <p className="text-center text-xs text-slate-400 pt-1">
        Having trouble? Contact the Electoral Officer at the accreditation desk.
      </p>
    </form>
  );
}
