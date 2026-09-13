import type { Metadata } from 'next';
import { getResults } from '@/app/actions/admin';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { TurnoutCards } from '@/components/results/TurnoutCards';
import { ResultsBoard } from '@/components/results/ResultsBoard';
import { RefreshResultsButton } from './RefreshResultsButton';

export const metadata: Metadata = { title: 'Live Results — NABAMS TPI Election' };
export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const { rows, totalVoters, totalVoted, error } = await getResults();

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="w-full max-w-lg bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl" role="img" aria-label="Error">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Database Connection Failed</h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="text-left text-xs bg-slate-50 border border-slate-200 p-4 rounded-lg font-mono text-slate-700 overflow-x-auto">
            1. Open <span className="font-bold text-slate-900">.env.local</span><br/>
            2. Check <span className="font-bold text-slate-900">SUPABASE_SERVICE_ROLE_KEY</span><br/>
            3. Ensure it starts with <span className="text-sky-700">eyJ</span> or <span className="text-sky-700">sb_</span><br/>
            4. Remove any stray quotes around it.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Results</h1>
          <p className="mt-1 text-xs font-medium text-slate-600">
            Final Tally = Raw Votes + Administrative Adjustments
          </p>
        </div>
        <RefreshResultsButton />
      </div>
      <TurnoutCards totalEligible={totalVoters} totalVoted={totalVoted} />
      <ResultsBoard rows={rows} />
    </div>
  );
}
