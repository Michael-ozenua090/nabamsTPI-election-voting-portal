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
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
              isComplete
                ? 'bg-nabams-gold text-gray-900'
                : 'bg-white/10 text-gray-400',
            ].join(' ')}
            aria-hidden
          >
            {displayOrder}
          </span>
          <h2
            id={`position-${positionId}-heading`}
            className="text-xl font-bold text-white sm:text-2xl"
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={[
              'h-2 w-2 rounded-full',
              isComplete ? 'bg-nabams-gold' : 'bg-gray-600',
            ].join(' ')}
            aria-hidden
          />
          <p
            className={[
              'text-xs font-medium uppercase tracking-wide',
              isComplete ? 'text-nabams-gold' : 'text-gray-500',
            ].join(' ')}
          >
            {isComplete ? '1 selected' : 'Choose 1'}
          </p>
        </div>
      </div>

      {/* Candidate grid */}
      {candidates.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
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
