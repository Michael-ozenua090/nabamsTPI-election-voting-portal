'use client';

import { Users, Vote, TrendingUp } from 'lucide-react';

interface TurnoutCardsProps {
  totalRoll: number;
  accreditedVoters: number;
  ballotsCast: number;
  turnoutPercentage: string;
}

export function TurnoutCards({ totalRoll, accreditedVoters, ballotsCast, turnoutPercentage }: TurnoutCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      
      {/* Card 1: Accredited Voters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Accredited Voters
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {accreditedVoters}
          </p>
          <p className="text-xs text-sky-700 font-medium mt-1">
            Eligible to vote • Out of {totalRoll} on roll
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: Ballots Cast */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Ballots Cast
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {ballotsCast}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {Math.max(0, accreditedVoters - ballotsCast)} accredited yet to vote
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0">
          <Vote className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: Voter Turnout */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Accredited Turnout
          </p>
          <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
            {turnoutPercentage}%
          </p>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {totalRoll > 0 ? ((ballotsCast / totalRoll) * 100).toFixed(1) : 0}% of total roll ({totalRoll})
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
}
