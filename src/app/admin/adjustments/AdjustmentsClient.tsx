'use client';

import { useState, useTransition } from 'react';
import { AdjustmentModal } from '@/components/admin/AdjustmentModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { removeAdjustment } from '@/app/actions/admin';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Candidate, Position, CandidateAdjustment } from '@/types/database';

interface AdjustmentsClientProps {
  positions: (Position & { candidates: Candidate[] })[];
  adjustments: (CandidateAdjustment & {
    candidates: { full_name: string; positions: { title: string } | null } | null;
  })[];
}

export function AdjustmentsClient({ positions, adjustments }: AdjustmentsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm('Remove this adjustment? This cannot be undone.')) return;
    startTransition(async () => {
      await removeAdjustment(id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Add Adjustment
        </Button>
      </div>

      {adjustments.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-gray-400">No adjustments recorded yet.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left">
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400">Candidate</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400">Delta</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400">Reason</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400">By</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {adjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{adj.candidates?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-500">{adj.candidates?.positions?.title ?? ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={adj.adjustment_votes >= 0 ? 'green' : 'red'}>
                      {adj.adjustment_votes > 0 ? '+' : ''}{adj.adjustment_votes}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-gray-300 text-xs line-clamp-2">{adj.reason}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{adj.authorized_by}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(adj.id)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                      aria-label="Delete adjustment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdjustmentModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); router.refresh(); }}
        positions={positions}
      />
    </>
  );
}
