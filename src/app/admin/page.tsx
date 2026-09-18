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
  
  const { getAccreditationStatus } = await import('@/app/actions/admin');
  const isAccreditationLocked = await getAccreditationStatus();

  const { count: totalVoters } = await supabase.from('voters').select('*', { count: 'exact', head: true });
  const { count: votedCount } = await supabase.from('voters').select('*', { count: 'exact', head: true }).eq('has_voted', true);
  const turnout = totalVoters && votedCount ? Math.round((votedCount / totalVoters) * 100) : 0;

  const stats = [
    {
      label: 'Eligible Voters',
      value: totalVoters ?? 0,
      subtext: 'ND1 + HND1 (Full Time & DPP)',
      icon: Users,
    },
    {
      label: 'Votes Cast',
      value: votedCount ?? 0,
      subtext: `${(totalVoters ?? 0) - (votedCount ?? 0)} yet to vote`,
      icon: Vote,
    },
    {
      label: 'Voter Turnout',
      value: `${turnout}%`,
      subtext: turnout >= 50 ? 'Quorum reached ✓' : 'Below 50%',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Election Dashboard</h1>
        <p className="mt-1 text-xs text-slate-600">
          Logged in as:{' '}
          <span className="font-semibold text-slate-800">{session?.email}</span>
        </p>
      </div>

      <ElectionControlPanel currentStatus={(config?.status as string) ?? 'pending'} isAccreditationLocked={isAccreditationLocked} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, subtext, icon: Icon }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-1">{String(value)}</p>
              <p className="text-xs text-sky-700 font-medium mt-1">{subtext}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-sky-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
