import type { Metadata } from 'next';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { VotersClient } from './VotersClient';

export const metadata: Metadata = { title: 'Voter Roll — NABAMS TPI Admin' };
export const dynamic = 'force-dynamic';

export default async function VotersPage() {
  const supabase = createAdminSupabaseClient();

  const { data: voters } = await supabase
    .from('voters')
    .select('matric_number, full_name, level, programme, has_voted, voted_at, passport_url, id_card_url, created_at')
    .order('created_at', { ascending: true });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Voter Roll</h1>
      <p className="text-sm text-gray-400">
        {(voters ?? []).length} voters registered · Manage late accreditations and view upload status.
      </p>
      <VotersClient voters={(voters ?? []) as any} />
    </div>
  );
}
