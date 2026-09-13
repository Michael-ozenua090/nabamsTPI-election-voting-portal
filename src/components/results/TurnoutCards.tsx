'use client';

import { Users, CheckSquare, TrendingUp } from 'lucide-react';

interface TurnoutCardsProps {
  totalEligible: number;
  totalVoted: number;
}

export function TurnoutCards({ totalEligible, totalVoted }: TurnoutCardsProps) {
  const turnoutPct =
    totalEligible > 0 ? Math.round((totalVoted / totalEligible) * 100) : 0;

  const cards = [
    {
      label: 'Eligible Voters',
      value: totalEligible.toLocaleString(),
      subtext: 'ND1 + HND1 (Full Time & DPP)',
      icon: Users,
    },
    {
      label: 'Ballots Cast',
      value: totalVoted.toLocaleString(),
      subtext: `${totalEligible - totalVoted} yet to vote`,
      icon: CheckSquare,
    },
    {
      label: 'Voter Turnout',
      value: `${turnoutPct}%`,
      subtext: turnoutPct >= 50 ? 'Quorum reached ✓' : 'Below 50%',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{card.value}</p>
              <p className="mt-1 text-xs text-sky-700 font-medium">{card.subtext}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-sky-600" aria-hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}
