'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAgentLiveResults, logoutAgent } from '@/app/actions/agent';
import { Crown, LogOut, Users, FileText, Activity } from 'lucide-react';

interface Candidate {
  id: string;
  position_id: string;
  full_name: string;
  image_url: string;
  is_disqualified: boolean;
  finalVotes: number;
}

interface Position {
  id: string;
  title: string;
  display_order: number;
}

interface AgentData {
  positions: Position[];
  candidates: Candidate[];
  totalRoll: number;
  accreditedVoters: number;
  ballotsCast: number;
  turnoutPercentage: string;
  error: string | null;
}

export default function AgentDashboard({ initialData }: { initialData: AgentData }) {
  const router = useRouter();
  const [data, setData] = useState<AgentData>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(15);

  useEffect(() => {
    const fetchResults = async () => {
      setIsRefreshing(true);
      const newData = await getAgentLiveResults();
      if (!newData.error) {
        setData(newData);
      }
      setIsRefreshing(false);
      setSecondsToRefresh(15);
    };

    const interval = setInterval(() => {
      setSecondsToRefresh((prev) => {
        if (prev <= 1) {
          fetchResults();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logoutAgent();
    router.push('/agent/login');
  };

  // Turnout percentage is pre-calculated by server
  const turnoutPct = data.turnoutPercentage;

  if (data.error && data.positions.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {data.error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* ── HEADER ── */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl p-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            <div className="relative w-12 h-12 bg-white rounded-full border-2 border-slate-100 z-10 shadow-sm overflow-hidden">
              <Image src="/poly-logo.png" alt="Poly Crest" fill className="object-cover p-1" />
            </div>
            <div className="relative w-12 h-12 bg-white rounded-full border-2 border-slate-100 z-0 shadow-sm overflow-hidden">
              <Image src="/nabams-logo.png" alt="NABAMS Logo" fill className="object-cover p-1" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Official Agent Live Monitor</h1>
            <p className="text-sm font-medium text-slate-500">Candidate & Party Representative Portal</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* ── LIVE INDICATOR & TURNOUT BAR ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-200 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
          <div className="relative z-10 flex items-center gap-3 mb-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-600"></span>
            </span>
            <span className="font-bold text-sky-900">Live Tally Active</span>
          </div>
          <p className="text-sm text-sky-700 font-medium z-10">Refreshes every {secondsToRefresh}s</p>
          {isRefreshing && <p className="text-xs text-sky-600 mt-1 z-10 animate-pulse">Syncing now...</p>}
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Accredited Voters</p>
            <p className="text-2xl font-black text-slate-900">{data.accreditedVoters.toLocaleString()}</p>
            <p className="text-xs text-sky-700 font-medium mt-0.5">Eligible to vote • Out of {data.totalRoll} on roll</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ballots Cast</p>
            <p className="text-2xl font-black text-slate-900">{data.ballotsCast.toLocaleString()}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{Math.max(0, data.accreditedVoters - data.ballotsCast)} accredited yet to vote</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Accredited Turnout</p>
            <p className="text-2xl font-black text-slate-900">{data.turnoutPercentage}%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{data.totalRoll > 0 ? ((data.ballotsCast / data.totalRoll) * 100).toFixed(1) : 0}% of total roll ({data.totalRoll})</p>
          </div>
        </div>
      </div>

      {/* ── RESULTS BOARD ── */}
      <div className="space-y-8 mt-4">
        {data.positions.map((pos) => {
          const posCandidates = data.candidates.filter(c => c.position_id === pos.id);
          const totalPositionVotes = posCandidates.reduce((acc, c) => acc + c.finalVotes, 0);

          const sortedCandidates = [...posCandidates]
            .map((c) => {
              const percentage = totalPositionVotes > 0 ? ((c.finalVotes / totalPositionVotes) * 100).toFixed(1) : '0.0';
              return { ...c, percentage: parseFloat(percentage) };
            })
            .sort((a, b) => b.finalVotes - a.finalVotes);

          const highestVote = sortedCandidates[0]?.finalVotes || 0;
          const hasVotes = totalPositionVotes > 0;

          return (
            <div key={pos.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl font-extrabold text-slate-900">{pos.title}</h2>
                <div className="text-sm font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                  Total Votes: {totalPositionVotes.toLocaleString()}
                </div>
              </div>

              {/* Candidates */}
              <div className="p-6 space-y-6">
                {sortedCandidates.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-4">No candidates found for this position.</p>
                ) : (
                  sortedCandidates.map((cand, idx) => {
                    const isLeader = hasVotes && cand.finalVotes === highestVote && !cand.is_disqualified;

                    return (
                      <div 
                        key={cand.id} 
                        className={`relative rounded-2xl p-5 border transition-all ${
                          isLeader ? 'bg-sky-50/50 border-sky-300 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'
                        } ${cand.is_disqualified ? 'opacity-60 bg-slate-50' : ''}`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          
                          {/* Info */}
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            {/* Rank */}
                            <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isLeader ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {idx + 1}
                            </span>

                            {/* Image */}
                            <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 bg-slate-100 rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                              {cand.image_url ? (
                                <img src={cand.image_url} alt={cand.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                                  {cand.full_name.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Name & Badge */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <h4 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight break-words">
                                  {cand.full_name}
                                </h4>
                                {isLeader && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    👑 Leading
                                  </span>
                                )}
                                {cand.is_disqualified && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                    Disqualified
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Tally */}
                          <div className="text-left sm:text-right flex-shrink-0 mt-2 sm:mt-0 pl-16 sm:pl-0">
                            <div className="text-3xl font-black text-slate-900 tracking-tight">
                              {cand.finalVotes.toLocaleString()}
                              <span className="text-sm font-medium text-slate-500 ml-1.5">votes</span>
                            </div>
                            <div className="text-sm font-bold text-sky-700 mt-0.5">
                              {cand.percentage}%
                            </div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-5 pl-16 sm:pl-0">
                          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ease-out ${
                                isLeader ? 'bg-gradient-to-r from-sky-500 to-sky-600 shadow-sm' : 'bg-slate-300'
                              }`}
                              style={{ width: `${Math.max(cand.percentage, cand.finalVotes > 0 ? 3 : 0)}%` }}
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
