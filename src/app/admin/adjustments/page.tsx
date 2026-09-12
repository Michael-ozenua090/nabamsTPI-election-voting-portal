import type { Metadata } from 'next';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { AdjustmentsClient } from './AdjustmentsClient';

export const metadata: Metadata = { title: 'Vote Adjustments \u2014 NABAMS TPI Admin' };
export const dynamic = 'force-dynamic';

export default async function AdjustmentsPage() {
  const supabase = createAdminSupabaseClient();

  const { data: positions } = await supabase
    .from('positions')
    .select('*, candidates(id, full_name, image_url, position_id, created_at)')
    .order('display_order');

  const { data: adjustments } = await supabase
    .from('candidate_adjustments')
    .select('*, candidates(full_name, positions(title))')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Vote Adjustments</h1>
      <p className="text-sm text-gray-400">
        Raw student ballots are never modified. Adjustments (positive or negative) are applied
        additively when computing final tallies. All adjustments require a mandatory reason.
      </p>
      <AdjustmentsClient
        positions={(positions ?? []) as any}
        adjustments={(adjustments ?? []) as any}
      />
    </div>
  );
}
