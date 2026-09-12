import type { Metadata } from 'next';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { CandidatesClient } from './CandidatesClient';

export const metadata: Metadata = { title: 'Candidate Manager — NABAMS TPI Admin' };
export const dynamic = 'force-dynamic';

export default async function CandidatesPage() {
  const supabase = createAdminSupabaseClient();

  const { data: positions } = await supabase
    .from('positions')
    .select('*, candidates(id, full_name, image_url, position_id, created_at)')
    .order('display_order');

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Candidate Manager</h1>
      <p className="text-sm text-gray-400">
        Add, edit, or remove candidates. Photos are compressed and stored in Supabase Storage.
      </p>
      <CandidatesClient positions={(positions ?? []) as any} />
    </div>
  );
}
