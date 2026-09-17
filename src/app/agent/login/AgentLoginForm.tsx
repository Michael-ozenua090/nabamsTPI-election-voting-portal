'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAgent } from '@/app/actions/agent';
import { Loader2, KeyRound } from 'lucide-react';

export default function AgentLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await loginAgent(formData);
      
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        router.push('/agent');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="access_code" className="block text-sm font-semibold text-slate-700">
          Agent Access Code
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <KeyRound className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="password"
            id="access_code"
            name="access_code"
            required
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-mono"
            placeholder="••••••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center py-2.5 px-4 mt-2 bg-[#012169] hover:bg-[#011a52] text-white font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#012169] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying Access...
          </>
        ) : (
          'Access Live Tally'
        )}
      </button>
    </form>
  );
}
