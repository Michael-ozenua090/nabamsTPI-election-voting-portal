import type { Metadata } from 'next';
import { getResults } from '@/app/actions/admin';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { TurnoutCards } from '@/components/results/TurnoutCards';
import { ResultsBoard } from '@/components/results/ResultsBoard';
import { RefreshResultsButton } from './RefreshResultsButton';

export const metadata: Metadata = { title: 'Live Results — NABAMS TPI Election' };
export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const rows = await getResults();
  const supabase = createAdminSupabaseClient();
  const { count: totalVoters } = await supabase.from('voters').select('*', { count: 'exact', head: true });
  const { count: votedCount } = await supabase.from('voters').select('*', { count: 'exact', head: true }).eq('has_voted', true);
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Results</h1>
          <p className="mt-1 text-sm text-gray-400">Final Tally = Raw Votes + Administrative Adjustments</p>
        </div>
        <RefreshResultsButton />
      </div>
      <TurnoutCards totalEligible={totalVoters ?? 0} totalVoted={votedCount ?? 0} />
      <ResultsBoard rows={rows} />
    </div>
  );
}
