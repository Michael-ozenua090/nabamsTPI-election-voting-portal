import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/session';
import { ElectionControlPanel } from './ElectionControlPanel';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Admin Dashboard — NABAMS TPI' };

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const supabase = createAdminSupabaseClient();
  const { data: config } = await supabase.from('election_config').select('status').eq('id', 1).single();
  const { count: totalVoters } = await supabase.from('voters').select('*', { count: 'exact', head: true });
  const { count: votedCount } = await supabase.from('voters').select('*', { count: 'exact', head: true }).eq('has_voted', true);
  const turnout = totalVoters && votedCount ? Math.round((votedCount / totalVoters) * 100) : 0;
  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Election Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">Logged in as: {session?.email}</p>
      </div>
      <ElectionControlPanel currentStatus={(config?.status as string) ?? 'pending'} />
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Eligible Voters', value: totalVoters ?? 0 },
          { label: 'Votes Cast', value: votedCount ?? 0 },
          { label: 'Turnout', value: `${turnout}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-2xl font-bold text-nabams-gold">{String(value)}</p>
            <p className="mt-1 text-xs text-gray-400 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
