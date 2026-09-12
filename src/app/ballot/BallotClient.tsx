'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PositionBlock } from '@/components/ballot/PositionBlock';
import { BallotReviewModal } from '@/components/ballot/BallotReviewModal';
import { castBallot } from '@/app/actions/ballot';
import type { PositionWithCandidates } from '@/types/database';
import { ChevronRight } from 'lucide-react';

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
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Voter info */}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{voter.full_name}</p>
              <p className="text-xs text-slate-400 font-mono">{voter.matric_number}</p>
            </div>
            {/* Badges */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${allComplete ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {completedCount}/{totalPositions}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                {voter.level}
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div
            className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={Math.round(progressPct)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Ballot progress: ${completedCount} of ${totalPositions} positions filled`}
          >
            <div
              className="h-full rounded-full bg-sky-500 transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ballot body */}
      <main className="container mx-auto max-w-3xl px-4 pt-8 pb-36 sm:px-6 sm:pt-12">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">
            NABAMS TPI — Official Ballot
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl tracking-tight">
            Executive Officers Election
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Select one candidate per position. You may leave a position blank to
            abstain. Review your choices before submitting — your ballot is final.
          </p>
        </header>

        {globalError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md py-3 px-4 shadow-lg">
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-4">
          <p className="hidden text-xs text-slate-500 sm:block">
            {allComplete
              ? '✓ All positions filled'
              : `${totalPositions - completedCount} position${totalPositions - completedCount !== 1 ? 's' : ''} remaining`}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            disabled={submitting}
            className="ml-auto flex items-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-semibold px-6 py-2.5 rounded-lg transition duration-150 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 text-sm shadow-sm"
          >
            Review Ballot
            <ChevronRight className="h-4 w-4" />
          </button>
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
