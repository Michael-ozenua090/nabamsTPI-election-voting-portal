'use client';

import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { PositionWithCandidates } from '@/types/database';

interface BallotSelection {
  positionId: string;
  candidateId: string | null;
}

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
          <div className="flex items-start gap-3 rounded-xl border border-amber-700/50 bg-amber-900/20 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              You have not selected a candidate for{' '}
              <strong>{unselectedCount}</strong>{' '}
              {unselectedCount === 1 ? 'position' : 'positions'}. Those positions
              will be counted as abstentions.
            </p>
          </div>
        )}

        {/* Selections list */}
        <ul className="max-h-80 divide-y divide-white/8 overflow-y-auto rounded-xl border border-white/10 text-sm">
          {positions.map((position) => {
            const candidateId = selections[position.id];
            const candidate = position.candidates.find((c) => c.id === candidateId);

            return (
              <li key={position.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-300">{position.title}</p>
                  {candidate ? (
                    <p className="mt-0.5 text-nabams-gold font-semibold">
                      {candidate.full_name}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-gray-500 italic">Abstaining</p>
                  )}
                </div>
                {candidate ? (
                  <CheckCircle className="h-5 w-5 text-nabams-gold flex-shrink-0" />
                ) : (
                  <span className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-600" />
                )}
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-gray-500">
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
            variant="secondary"
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
