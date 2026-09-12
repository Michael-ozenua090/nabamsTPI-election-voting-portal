'use client';

import { CandidateCard } from './CandidateCard';
import type { Candidate } from '@/types/database';

interface PositionBlockProps {
  positionId: string;
  title: string;
  displayOrder: number;
  candidates: Pick<Candidate, 'id' | 'full_name' | 'image_url'>[];
  selectedCandidateId: string | null;
  onSelect: (positionId: string, candidateId: string | null) => void;
  isComplete: boolean;
}

export function PositionBlock({
  positionId,
  title,
  displayOrder,
  candidates,
  selectedCandidateId,
  onSelect,
  isComplete,
}: PositionBlockProps) {
  return (
    <section aria-labelledby={`position-${positionId}-heading`} className="space-y-4">
      {/* Position header */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
              isComplete
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-500',
            ].join(' ')}
            aria-hidden
          >
            {displayOrder}
          </span>
          <h2
            id={`position-${positionId}-heading`}
            className="text-lg sm:text-xl font-bold text-slate-900"
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={[
              'h-2 w-2 rounded-full',
              isComplete ? 'bg-sky-500' : 'bg-slate-300',
            ].join(' ')}
            aria-hidden
          />
          <p
            className={[
              'text-xs font-medium uppercase tracking-wide',
              isComplete ? 'text-sky-600' : 'text-slate-400',
            ].join(' ')}
          >
            {isComplete ? '1 selected' : 'Select 1 candidate'}
          </p>
        </div>
      </div>

      {/* Candidate grid */}
      {candidates.length === 0 ? (
        <p className="text-sm text-slate-400 italic">
          No candidates registered for this position.
        </p>
      ) : (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          role="radiogroup"
          aria-labelledby={`position-${positionId}-heading`}
        >
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              checked={selectedCandidateId === candidate.id}
              onSelect={() => onSelect(positionId, candidate.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
