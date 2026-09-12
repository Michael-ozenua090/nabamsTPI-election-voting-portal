'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addVoter, resetVoter } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PlusCircle, RotateCcw, CheckCircle, XCircle, Search } from 'lucide-react';
import type { Voter } from '@/types/database';

type VoterRow = Pick<Voter, 'matric_number' | 'full_name' | 'level' | 'programme' | 'has_voted' | 'voted_at' | 'passport_url' | 'id_card_url'>;

export function VotersClient({ voters }: { voters: VoterRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const filtered = voters.filter(
    (v) =>
      v.matric_number.includes(search) ||
      v.full_name.toLowerCase().includes(search.toLowerCase())
  );

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

  function handleReset(matric: string) {
    if (!confirm(`Reset has_voted for ${matric}? They will be able to vote again.`)) return;
    startTransition(async () => {
      await resetVoter(matric);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search matric or name…"
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nabams-green"
          />
        </div>
        <Button size="sm" onClick={() => setAddModalOpen(true)}>
          <PlusCircle className="h-4 w-4" /> Add Voter
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left">
              {['Matric', 'Name', 'Level', 'Programme', 'Voted', 'Docs', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-xs uppercase tracking-wide text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {filtered.map((v) => (
              <tr key={v.matric_number} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-300">{v.matric_number}</td>
                <td className="px-4 py-3 font-medium text-white">{v.full_name}</td>
                <td className="px-4 py-3">
                  <Badge variant={v.level === 'ND1' ? 'green' : 'blue'}>{v.level}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{v.programme}</td>
                <td className="px-4 py-3">
                  {v.has_voted ? (
                    <span className="flex items-center gap-1 text-green-400 text-xs">
                      <CheckCircle className="h-3.5 w-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <XCircle className="h-3.5 w-3.5" /> No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <span title="Passport" className={`h-2.5 w-2.5 rounded-full ${v.passport_url ? 'bg-green-400' : 'bg-gray-600'}`} />
                    <span title="ID Card" className={`h-2.5 w-2.5 rounded-full ${v.id_card_url ? 'bg-green-400' : 'bg-gray-600'}`} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {v.has_voted && (
                    <button
                      onClick={() => handleReset(v.matric_number)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-gray-500 hover:text-amber-400 hover:bg-amber-900/20 transition-colors"
                      title="Reset vote status"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  {search ? 'No voters match your search.' : 'No voters registered yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Voter (Late Accreditation)">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input id="v-matric" name="matric_number" label="Matric Number (13 digits)" inputMode="numeric" maxLength={13} pattern="[0-9]{13}" placeholder="2025231010270" required />
          <Input id="v-name" name="full_name" label="Full Name" placeholder="Surname Firstname Othername" required />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300" htmlFor="v-level">Level</label>
              <select id="v-level" name="level" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nabams-green">
                <option value="ND1">ND1</option>
                <option value="HND1">HND1</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300" htmlFor="v-prog">Programme</label>
              <select id="v-prog" name="programme" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nabams-green">
                <option value="Full Time">Full Time</option>
                <option value="DPP">DPP</option>
              </select>
            </div>
          </div>
          <Input id="v-pin" name="voting_pin" label="Voting PIN" placeholder="Assign a unique PIN" required />
          {addError && <p className="text-sm text-red-400">{addError}</p>}
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" loading={addLoading} fullWidth>Add Voter</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
