'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { PositionWithCandidates } from '@/types/database';

interface BallotReviewModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  positions: PositionWithCandidates[];
  selections: Record<string, string | null>;
}

export function BallotReviewModal({
  open,
  onClose,
  onConfirm,
  submitting,
  positions,
  selections,
}: BallotReviewModalProps) {
  const allSelected = positions.every((p) => selections[p.id] !== null && selections[p.id] !== undefined);
  const unselectedCount = positions.filter((p) => !selections[p.id]).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Review Your Ballot"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Warning if incomplete */}
        {!allSelected && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              You have not selected a candidate for{' '}
              <strong>{unselectedCount}</strong>{' '}
              {unselectedCount === 1 ? 'position' : 'positions'}. Those positions
              will be counted as abstentions.
            </p>
          </div>
        )}

        {/* Selections list */}
        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 text-sm">
          {positions.map((position) => {
            const candidateId = selections[position.id];
            const candidate = position.candidates.find((c) => c.id === candidateId);

            return (
              <li key={position.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-white">
                <div>
                  <p className="font-medium text-slate-700">{position.title}</p>
                  {candidate ? (
                    <p className="mt-0.5 text-sky-700 font-semibold">
                      {candidate.full_name}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-slate-400 italic">Abstaining</p>
                  )}
                </div>
                {candidate ? (
                  <CheckCircle className="h-5 w-5 text-sky-600 flex-shrink-0" />
                ) : (
                  <span className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-slate-300" />
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-slate-500">
          Once submitted, your ballot is final and cannot be changed.
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            fullWidth
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={submitting}
            disabled={submitting}
            fullWidth
          >
            {submitting ? 'Submitting…' : 'Confirm & Submit'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
