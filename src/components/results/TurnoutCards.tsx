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
      color: 'text-blue-400',
      bg: 'bg-blue-900/20 border-blue-700/30',
    },
    {
      label: 'Ballots Cast',
      value: totalVoted.toLocaleString(),
      subtext: `${totalEligible - totalVoted} yet to vote`,
      icon: CheckSquare,
      color: 'text-nabams-gold',
      bg: 'bg-yellow-900/20 border-yellow-700/30',
    },
    {
      label: 'Voter Turnout',
      value: `${turnoutPct}%`,
      subtext: turnoutPct >= 50 ? 'Quorum reached ✓' : 'Below 50%',
      icon: TrendingUp,
      color: turnoutPct >= 50 ? 'text-green-400' : 'text-amber-400',
      bg:
        turnoutPct >= 50
          ? 'bg-green-900/20 border-green-700/30'
          : 'bg-amber-900/20 border-amber-700/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`rounded-2xl border p-5 ${card.bg} backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {card.label}
                </p>
                <p className={`mt-2 text-3xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-gray-500">{card.subtext}</p>
              </div>
              <div className={`rounded-xl p-2.5 bg-white/5`}>
                <Icon className={`h-5 w-5 ${card.color}`} aria-hidden />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
