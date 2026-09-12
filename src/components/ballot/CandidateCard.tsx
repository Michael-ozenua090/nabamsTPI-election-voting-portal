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
        'group relative block cursor-pointer overflow-hidden rounded-xl border transition-all duration-200',
        'bg-white/5 backdrop-blur-sm',
        checked
          ? 'border-nabams-gold shadow-lg shadow-yellow-900/30 ring-1 ring-nabams-gold'
          : 'border-white/10 hover:border-white/25 hover:bg-white/8',
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
      <div className="relative aspect-square overflow-hidden bg-white/5">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-12 w-12 text-gray-600" aria-hidden />
          </div>
        )}

        {/* Check overlay */}
        {checked && (
          <span
            aria-hidden
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-nabams-gold text-gray-900 shadow-lg"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}

        {/* Gold tint overlay when selected */}
        {checked && (
          <div className="absolute inset-0 bg-nabams-gold/8 pointer-events-none" />
        )}
      </div>

      {/* Name */}
      <div
        className={[
          'border-t px-3 py-2.5 transition-colors',
          checked ? 'border-nabams-gold/40 bg-yellow-900/20' : 'border-white/8',
        ].join(' ')}
      >
        <p
          className={[
            'line-clamp-2 text-sm leading-snug font-medium text-center',
            checked ? 'text-nabams-gold' : 'text-gray-200',
          ].join(' ')}
        >
          {candidate.full_name}
        </p>
      </div>
    </label>
  );
}
