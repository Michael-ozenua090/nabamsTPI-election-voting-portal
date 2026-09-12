'use client';

import { Crown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { ResultsRow } from '@/types/database';

interface ResultsBoardProps {
  rows: ResultsRow[];
}

interface PositionGroup {
  position_id: string;
  position_title: string;
  candidates: ResultsRow[];
}

export function ResultsBoard({ rows }: ResultsBoardProps) {
  // Group by position
  const groups = rows.reduce<Record<string, PositionGroup>>((acc, row) => {
    if (!acc[row.position_id]) {
      acc[row.position_id] = {
        position_id: row.position_id,
        position_title: row.position_title,
        candidates: [],
      };
    }
    acc[row.position_id]!.candidates.push(row);
    return acc;
  }, {});

  const sortedGroups = Object.values(groups).sort((a, b) =>
    a.position_title.localeCompare(b.position_title)
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-gray-400">No results yet. Polls may not have started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map((group) => {
        const maxFinal = Math.max(...group.candidates.map((c) => c.final_tally), 0);

        const sorted = [...group.candidates].sort(
          (a, b) => b.final_tally - a.final_tally
        );

        return (
          <section
            key={group.position_id}
            className="rounded-2xl border border-white/10 bg-white/3 overflow-hidden"
          >
            <div className="border-b border-white/10 bg-white/5 px-6 py-4">
              <h3 className="text-base font-bold text-white">{group.position_title}</h3>
            </div>

            <div className="divide-y divide-white/8">
              {sorted.map((candidate, idx) => {
                const isWinner = candidate.final_tally === maxFinal && maxFinal > 0;
                const pct =
                  maxFinal > 0
                    ? Math.round((candidate.final_tally / maxFinal) * 100)
                    : 0;
                const totalForPosition = sorted.reduce(
                  (s, c) => s + c.final_tally,
                  0
                );
                const voteSharePct =
                  totalForPosition > 0
                    ? Math.round((candidate.final_tally / totalForPosition) * 100)
                    : 0;

                return (
                  <div
                    key={candidate.candidate_id}
                    className={[
                      'px-6 py-4 transition-colors',
                      isWinner && idx === 0 ? 'bg-yellow-900/10' : '',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <span
                        className={[
                          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
                          isWinner && idx === 0
                            ? 'bg-nabams-gold text-gray-900'
                            : 'bg-white/10 text-gray-400',
                        ].join(' ')}
                      >
                        {idx + 1}
                      </span>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-white truncate">
                            {candidate.full_name}
                          </p>
                          {isWinner && idx === 0 && (
                            <span className="flex items-center gap-1 text-xs text-nabams-gold font-medium">
                              <Crown className="h-3.5 w-3.5" aria-hidden />
                              Leading
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2 flex items-center gap-3">
                          <div
                            className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className={[
                                'h-full rounded-full transition-[width] duration-700',
                                isWinner && idx === 0
                                  ? 'bg-nabams-gold'
                                  : 'bg-nabams-green',
                              ].join(' ')}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
                            {voteSharePct}%
                          </span>
                        </div>
                      </div>

                      {/* Tally columns */}
                      <div className="flex items-center gap-6 text-right text-sm flex-shrink-0">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Raw</p>
                          <p className="font-semibold text-gray-200">{candidate.raw_votes}</p>
                        </div>
                        {candidate.adjustment_votes !== 0 && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Adj</p>
                            <p
                              className={[
                                'font-semibold',
                                candidate.adjustment_votes > 0
                                  ? 'text-green-400'
                                  : 'text-red-400',
                              ].join(' ')}
                            >
                              {candidate.adjustment_votes > 0 ? '+' : ''}
                              {candidate.adjustment_votes}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Final</p>
                          <p className="text-lg font-bold text-white">
                            {candidate.final_tally}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Adjustment reasons */}
                    {candidate.adjustments.length > 0 && (
                      <div className="mt-3 space-y-1.5 pl-12">
                        {candidate.adjustments.map((adj) => (
                          <div
                            key={adj.id}
                            className="flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2"
                          >
                            <Badge
                              variant={adj.adjustment_votes >= 0 ? 'green' : 'red'}
                            >
                              {adj.adjustment_votes > 0 ? '+' : ''}
                              {adj.adjustment_votes}
                            </Badge>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-300">{adj.reason}</p>
                              <p className="text-xs text-gray-500">
                                by {adj.authorized_by}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
