'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PositionBlock } from '@/components/ballot/PositionBlock';
import { BallotReviewModal } from '@/components/ballot/BallotReviewModal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { castBallot } from '@/app/actions/ballot';
import type { PositionWithCandidates } from '@/types/database';

interface VoterInfo {
  full_name: string;
  matric_number: string;
  level: 'ND1' | 'HND1';
  programme: string;
}

interface BallotClientProps {
  voter: VoterInfo;
  positions: PositionWithCandidates[];
}

export function BallotClient({ voter, positions }: BallotClientProps) {
  const router = useRouter();

  // selections[positionId] = candidateId | null (null = abstain/unselected)
  const [selections, setSelections] = useState<Record<string, string | null>>(() => {
    const init: Record<string, string | null> = {};
    for (const p of positions) init[p.id] = null;
    return init;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const handleSelect = useCallback((positionId: string, candidateId: string | null) => {
    setSelections((prev) => ({ ...prev, [positionId]: candidateId }));
  }, []);

  const completedCount = positions.filter((p) => selections[p.id] !== null).length;
  const totalPositions = positions.length;
  const progressPct = totalPositions === 0 ? 0 : (completedCount / totalPositions) * 100;
  const allComplete = completedCount === totalPositions;

  async function handleConfirm() {
    setSubmitting(true);
    setGlobalError('');

    const ballot = positions.map((p) => ({
      position_id: p.id,
      candidate_id: selections[p.id] ?? null,
    }));

    const result = await castBallot(ballot);

    if (result.error) {
      setGlobalError(result.error);
      setSubmitting(false);
      setModalOpen(false);
      return;
    }

    // Store reference code in sessionStorage for receipt page
    if (result.referenceCode) {
      sessionStorage.setItem('nabams_ref', result.referenceCode);
      sessionStorage.setItem('nabams_voted_at', result.votedAt ?? '');
    }

    router.replace('/receipt');
  }

  return (
    <>
      {/* Sticky progress header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-nabams-dark/95 backdrop-blur-sm">
        <div className="container mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Voter info */}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{voter.full_name}</p>
              <p className="text-xs text-gray-500">{voter.matric_number}</p>
            </div>
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={allComplete ? 'gold' : 'gray'}>
                  {completedCount}/{totalPositions}
                </Badge>
                <Badge variant={voter.level === 'ND1' ? 'green' : 'blue'}>
                  {voter.level}
                </Badge>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Ballot progress: ${completedCount} of ${totalPositions} positions filled`}
          >
            <div
              className="h-full rounded-full bg-nabams-gold transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ballot body */}
      <main className="container mx-auto max-w-3xl px-4 pt-8 pb-36 sm:px-6 sm:pt-12">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-nabams-gold">
            NABAMS TPI — Official Ballot
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            Executive Officers Election
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Select one candidate per position. You may leave a position blank to
            abstain. Review your choices before submitting — your ballot is final.
          </p>
        </header>

        {globalError && (
          <div className="mb-6 rounded-xl border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
            {globalError}
          </div>
        )}

        <div className="space-y-12">
          {positions.map((position, idx) => (
            <PositionBlock
              key={position.id}
              positionId={position.id}
              title={position.title}
              displayOrder={idx + 1}
              candidates={position.candidates}
              selectedCandidateId={selections[position.id] ?? null}
              onSelect={handleSelect}
              isComplete={selections[position.id] !== null}
            />
          ))}
        </div>
      </main>

      {/* Fixed footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-nabams-dark/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <p className="hidden text-xs text-gray-500 sm:block">
            {allComplete
              ? '✓ All positions filled'
              : `${totalPositions - completedCount} position${totalPositions - completedCount !== 1 ? 's' : ''} remaining`}
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            disabled={submitting}
            size="lg"
            variant={allComplete ? 'secondary' : 'outline'}
            className="ml-auto"
          >
            Review Ballot →
          </Button>
        </div>
      </div>

      {/* Review modal */}
      <BallotReviewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        submitting={submitting}
        positions={positions}
        selections={selections}
      />
    </>
  );
}
