import { redirect } from 'next/navigation';
import { getVoterSession } from '@/lib/session';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { InstitutionalHeader } from '@/components/InstitutionalHeader';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default async function FlaggedPage() {
  const session = await getVoterSession();
  if (!session) redirect('/');

  const supabase = createAdminSupabaseClient();
  const { data: voter } = await supabase
    .from('voters')
    .select('*')
    .eq('matric_number', session.matric_number)
    .single();

  if (!voter?.is_flagged) {
    redirect('/ballot');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <InstitutionalHeader />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden text-center p-8 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
          
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Flagged — Voting Suspended</h1>
          <p className="text-sm text-slate-500 mb-6">
            {voter.full_name} • {voter.matric_number} • {voter.level} {voter.programme}
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left my-6">
            <p className="text-xs font-bold uppercase tracking-wider text-red-800 mb-1">
              Reason for Flagging:
            </p>
            <p className="text-sm font-medium text-red-900">
              {voter.flagged_reason || 'Documentation review required.'}
            </p>
          </div>

          <p className="text-sm text-slate-600 mb-8">
            If you believe this is an error or wish to re-verify your documents, please visit the Electoral Committee at the Departmental Office with your original physical School ID card.
          </p>

          <form action="/actions/logout" method="POST">
            <Button type="submit" variant="outline" fullWidth>Sign Out</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
