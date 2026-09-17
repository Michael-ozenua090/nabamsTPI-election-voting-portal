'use client';

import Image from 'next/image';
import { Crown, AlertCircle } from 'lucide-react';
import type { ResultsRow } from '@/types/database';

interface ResultsBoardProps {
  rows: ResultsRow[];
}

export function ResultsBoard({ rows }: ResultsBoardProps) {
  // Group by position
  const groups = rows.reduce<Record<string, {
    position_id: string;
    position_title: string;
    candidates: ResultsRow[];
  }>>((acc, row) => {
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

  return (
    <div className="space-y-8 mt-6">
      {/* Live Indicator Banner */}
      <div className="flex items-center justify-between bg-sky-50/80 border border-sky-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600"></span>
          </span>
          <p className="text-xs sm:text-sm font-semibold text-sky-950">
            Live Election Results • Real-Time Ballot Tallying Active
          </p>
        </div>
        <span className="text-xs font-medium text-sky-700 bg-white px-2.5 py-1 rounded-md border border-sky-200 shadow-sm">
          Formula: Final = Raw + Adj
        </span>
      </div>

      {/* Grid of Position Result Cards */}
      <div className="grid grid-cols-1 gap-8">
        {sortedGroups.map((group) => {
          const posCandidates = group.candidates;

          // Calculate total votes cast for this position
          const totalPositionVotes = posCandidates.reduce((acc, c) => acc + Math.max(0, c.final_tally), 0);

          // Calculate final tallies and sort by highest vote count
          const candidateResults = [...posCandidates]
            .map((cand) => {
              const percentage = totalPositionVotes > 0 
                ? ((cand.final_tally / totalPositionVotes) * 100).toFixed(1) 
                : '0.0';

              return {
                ...cand,
                percentage: parseFloat(percentage),
              };
            })
            .sort((a, b) => b.final_tally - a.final_tally);

          // Determine leader (if any votes have been cast)
          const highestVote = candidateResults[0]?.final_tally || 0;
          const hasVotes = totalPositionVotes > 0;

          return (
            <div
              key={group.position_id}
              className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden"
            >
              {/* Position Header */}
              <div className="bg-gradient-to-r from-slate-50 via-white to-sky-50/30 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {group.position_title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {posCandidates.length} candidate{posCandidates.length !== 1 ? 's' : ''} contesting
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    Total: {totalPositionVotes} votes
                  </span>
                </div>
              </div>

              {/* Candidates List within Position Card */}
              <div className="p-6 space-y-6">
                {candidateResults.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm italic">
                    No candidates registered for this position.
                  </div>
                ) : (
                  candidateResults.map((cand, idx) => {
                    const isLeader = hasVotes && cand.final_tally === highestVote && cand.final_tally > 0;

                    return (
                      <div
                        key={cand.candidate_id}
                        className={`relative rounded-2xl p-4 sm:p-5 border transition ${
                          isLeader
                            ? 'bg-sky-50/40 border-sky-300 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          
                          {/* Left: Large Photo + Name + Badge */}
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Rank Number */}
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isLeader ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>

                            {/* Prominent Large Candidate Portrait */}
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex-shrink-0 shadow-sm">
                              {cand.image_url ? (
                                <Image
                                  src={cand.image_url}
                                  alt={cand.full_name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl">
                                  {cand.full_name.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Candidate Identity */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                                  {cand.full_name}
                                </h4>
                                
                                {isLeader && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                                    <Crown className="w-3.5 h-3.5 text-amber-700 fill-amber-500" />
                                    Leading
                                  </span>
                                )}
                              </div>

                              {/* Audit Subtext */}
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                <span>Raw: <strong className="text-slate-700">{cand.raw_votes}</strong></span>
                                {cand.adjustment_votes !== 0 && (
                                  <span className={cand.adjustment_votes > 0 ? 'text-emerald-700 font-medium' : 'text-red-600 font-medium'}>
                                    Adj: {cand.adjustment_votes > 0 ? `+${cand.adjustment_votes}` : cand.adjustment_votes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Vote Tally & Percentage */}
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                              {cand.final_tally}
                              <span className="text-xs font-medium text-slate-400 ml-1">votes</span>
                            </p>
                            <p className="text-sm font-bold text-sky-700">
                              {cand.percentage}%
                            </p>
                          </div>

                        </div>

                        {/* Animated Visual Progress Bar */}
                        <div className="mt-4 pt-2">
                          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${
                                isLeader
                                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 shadow-sm'
                                  : 'bg-slate-300'
                              }`}
                              style={{ width: `${Math.max(cand.percentage, cand.final_tally > 0 ? 3 : 0)}%` }}
                            />
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
