import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/session';
import { ElectionControlPanel } from './ElectionControlPanel';
import type { Metadata } from 'next';
import { Users, Vote, TrendingUp } from 'lucide-react';

export const metadata: Metadata = { title: 'Admin Dashboard — NABAMS TPI' };

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  const supabase = createAdminSupabaseClient();
  const { data: config } = await supabase.from('election_config').select('status').eq('id', 1).single();
  const { count: totalVoters } = await supabase.from('voters').select('*', { count: 'exact', head: true });
  const { count: votedCount } = await supabase.from('voters').select('*', { count: 'exact', head: true }).eq('has_voted', true);
  const turnout = totalVoters && votedCount ? Math.round((votedCount / totalVoters) * 100) : 0;

  const stats = [
    { label: 'Eligible Voters', value: totalVoters ?? 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' },
    { label: 'Votes Cast', value: votedCount ?? 0, icon: Vote, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Voter Turnout', value: `${turnout}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  ];

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Election Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Logged in as: <span className="font-medium text-slate-700">{session?.email}</span></p>
      </div>

      <ElectionControlPanel currentStatus={(config?.status as string) ?? 'pending'} />

      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`bg-white border ${border} rounded-xl p-5 text-center shadow-sm`}>
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${bg} border ${border} mx-auto mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{String(value)}</p>
            <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
