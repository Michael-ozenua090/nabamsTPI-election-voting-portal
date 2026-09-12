import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getVoterSession } from '@/lib/session';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { BallotClient } from './BallotClient';
import { InstitutionalHeader } from '@/components/InstitutionalHeader';
import type { PositionWithCandidates } from '@/types/database';

export const metadata: Metadata = {
  title: 'Your Ballot — NABAMS TPI Election',
  description: 'Cast your official executive election ballot.',
};

export default async function BallotPage() {
  const session = await getVoterSession();
  if (!session) redirect('/');

  const supabase = createAdminSupabaseClient();

  // Check election status
  const { data: config } = await supabase
    .from('election_config')
    .select('status')
    .eq('id', 1)
    .single();

  const status = (config?.status as string) ?? 'pending';

  if (status !== 'open') {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-amber-200 bg-amber-50 mb-6">
            <span className="text-4xl" role="img" aria-label="Paused">
              {status === 'paused' ? '⏸️' : status === 'closed' ? '🔒' : '⏳'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {status === 'paused'
              ? 'Voting is Temporarily Paused'
              : status === 'closed'
              ? 'Polls Have Closed'
              : 'Voting Has Not Started Yet'}
          </h1>
          <p className="mt-3 text-slate-500">
            {status === 'paused'
              ? 'The Electoral Officer has paused voting. Please wait and try again shortly.'
              : status === 'closed'
              ? 'The election has concluded. Thank you for your participation.'
              : 'The election will open shortly. Please check back with the Electoral Officer.'}
          </p>
        </div>
      </main>
    );
  }

  // Check voter hasn't already voted
  const { data: voter } = await supabase
    .from('voters')
    .select('has_voted, full_name, level, programme, passport_url, id_card_url')
    .eq('matric_number', session.matric_number)
    .single();

  if (voter?.has_voted) redirect('/already-voted');
  if (!voter?.passport_url || !voter?.id_card_url) redirect('/accreditation');

  // Fetch positions + candidates (ordered)
  const { data: positions } = await supabase
    .from('positions')
    .select('*, candidates(id, full_name, image_url, position_id, created_at)')
    .order('display_order', { ascending: true });

  const positionsWithCandidates: PositionWithCandidates[] = (positions ?? []).map(
    (p) => ({
      ...p,
      candidates: (p.candidates ?? []) as PositionWithCandidates['candidates'],
    })
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InstitutionalHeader />
      <BallotClient
        voter={{
          full_name: voter?.full_name as string,
          matric_number: session.matric_number,
          level: session.level,
          programme: voter?.programme as string,
        }}
        positions={positionsWithCandidates}
      />
    </div>
  );
}
