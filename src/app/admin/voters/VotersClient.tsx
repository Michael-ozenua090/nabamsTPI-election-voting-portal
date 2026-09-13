'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { addVoter } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PlusCircle, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { Voter } from '@/types/database';
import Link from 'next/link';

type VoterRow = Pick<Voter, 'matric_number' | 'full_name' | 'level' | 'programme' | 'has_voted' | 'voted_at' | 'passport_url' | 'id_card_url'>;

interface VotersClientProps {
  voters: VoterRow[];
  total: number;
  totalPages: number;
  currentPage: number;
  initialSearch: string;
  initialLevel: string;
  initialProgramme: string;
  initialStatus: string;
}

export function VotersClient({
  voters,
  total,
  totalPages,
  currentPage,
  initialSearch,
  initialLevel,
  initialProgramme,
  initialStatus,
}: VotersClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(initialSearch);
  const [level, setLevel] = useState(initialLevel);
  const [programme, setProgramme] = useState(initialProgramme);
  const [status, setStatus] = useState(initialStatus);
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const isInitialMount = useRef(true);

  // Helper to push URL updates while preserving existing parameters
  function updateFilters(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'All') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  // Debounce search input and update URL. ONLY runs on search text change!
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      updateFilters({ search, page: '1' });
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    updateFilters({ page: newPage.toString() });
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await addVoter(fd);
    setAddLoading(false);
    if (result?.error) { setAddError(result.error); return; }
    setAddModalOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matric or name…"
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150"
          />
        </div>
        
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            updateFilters({ level: e.target.value, page: '1' });
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150"
        >
          <option value="All">All Levels</option>
          <option value="ND1">ND1</option>
          <option value="HND1">HND1</option>
        </select>
        
        <select
          value={programme}
          onChange={(e) => {
            setProgramme(e.target.value);
            updateFilters({ programme: e.target.value, page: '1' });
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150"
        >
          <option value="All">All Programmes</option>
          <option value="Full Time">Full Time</option>
          <option value="DPP">DPP</option>
        </select>
        
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            updateFilters({ status: e.target.value, page: '1' });
          }}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition duration-150"
        >
          <option value="All">All Statuses</option>
          <option value="Voted">Voted</option>
          <option value="Pending">Pending</option>
        </select>

        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Add Voter
        </Button>
      </div>

      <div className={`rounded-xl border border-slate-200 overflow-x-auto bg-white shadow-sm ${isPending ? 'opacity-50 pointer-events-none' : 'opacity-100'} transition-opacity duration-200`}>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-left">
              {['Matric', 'Name', 'Level', 'Programme', 'Voted', 'Docs', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-xs uppercase tracking-wider text-slate-700 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {voters.map((v) => (
              <tr key={v.matric_number} className="hover:bg-sky-50/40 transition-colors border-b border-slate-100">
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{v.matric_number}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{v.full_name}</td>
                <td className="px-4 py-3">
                  <Badge variant={v.level === 'ND1' ? 'green' : 'blue'}>{v.level}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{v.programme}</td>
                <td className="px-4 py-3">
                  {v.has_voted ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                      <CheckCircle className="h-3.5 w-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <XCircle className="h-3.5 w-3.5" /> No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <span title="Passport" className={`h-2.5 w-2.5 rounded-full ${v.passport_url ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                    <span title="ID Card" className={`h-2.5 w-2.5 rounded-full ${v.id_card_url ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/voters/${v.matric_number}`}>
                    <Button variant="outline" size="sm" className="!px-2 !py-1 text-sky-700 border-sky-300 hover:bg-sky-50">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {voters.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                  {search ? 'No voters match your search.' : 'No voters registered yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="border-t border-slate-200 bg-white p-4 flex items-center justify-between rounded-b-xl">
            <span className="text-sm text-slate-500">
              Page {currentPage} of {totalPages} <span className="hidden sm:inline">· {total} Total Voters</span>
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage <= 1 || isPending}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage >= totalPages || isPending}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Voter (Late Accreditation)">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input id="v-matric" name="matric_number" label="Matric Number (13 digits)" inputMode="numeric" maxLength={13} pattern="[0-9]{13}" placeholder="2025231010270" required />
          <Input id="v-name" name="full_name" label="Full Name" placeholder="Surname Firstname Othername" required />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-800 block" htmlFor="v-level">Level</label>
              <select id="v-level" name="level" required className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg shadow-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition">
                <option value="ND1">ND1</option>
                <option value="HND1">HND1</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-800 block" htmlFor="v-prog">Programme</label>
              <select id="v-prog" name="programme" className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg shadow-sm focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition">
                <option value="Full Time">Full Time</option>
                <option value="DPP">DPP</option>
              </select>
            </div>
          </div>
          <Input id="v-pin" name="voting_pin" label="Voting PIN" placeholder="Assign a unique PIN" required />
          {addError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {addError}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" loading={addLoading} fullWidth>Add Voter</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
