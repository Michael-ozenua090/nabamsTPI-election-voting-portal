'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Check, User } from 'lucide-react';
import type { Candidate } from '@/types/database';

interface CandidateCardProps {
  candidate: Pick<Candidate, 'id' | 'full_name' | 'image_url'>;
  checked: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export function CandidateCard({
  candidate,
  checked,
  onSelect,
  disabled = false,
}: CandidateCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <label
      className={[
        'group relative block cursor-pointer overflow-hidden rounded-xl border transition duration-150',
        checked
          ? 'bg-sky-50/40 border-2 border-sky-600 shadow-sm'
          : 'bg-white border border-slate-200 hover:border-sky-300 hover:shadow-sm',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={disabled ? undefined : onSelect}
      role="radio"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {/* Hidden radio input for accessibility */}
      <input
        type="radio"
        className="sr-only"
        checked={checked}
        onChange={onSelect}
        disabled={disabled}
        aria-label={`Select ${candidate.full_name}`}
      />

      {/* Photo */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {candidate.image_url && !imgError ? (
          <Image
            src={candidate.image_url}
            alt={candidate.full_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <User className="h-12 w-12 text-slate-300" aria-hidden />
          </div>
        )}

        {/* Check overlay */}
        {checked && (
          <span
            aria-hidden
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-white shadow-md"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}

        {/* Sky tint overlay when selected */}
        {checked && (
          <div className="absolute inset-0 bg-sky-600/8 pointer-events-none" />
        )}
      </div>

      {/* Name */}
      <div
        className={[
          'border-t px-3 py-2.5 transition-colors',
          checked ? 'border-sky-200 bg-sky-50/60' : 'border-slate-100 bg-white',
        ].join(' ')}
      >
        <p
          className={[
            'line-clamp-2 text-sm leading-snug font-medium text-center',
            checked ? 'text-sky-800' : 'text-slate-700',
          ].join(' ')}
        >
          {candidate.full_name}
        </p>
      </div>
    </label>
  );
}
