'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { addCandidate, deleteCandidate } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Trash2, PlusCircle, User } from 'lucide-react';
import type { Candidate, Position } from '@/types/database';

const SELECT_CLS =
  'w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition';

interface CandidatesClientProps {
  positions: (Position & { candidates: Candidate[] })[];
}

export function CandidatesClient({ positions }: CandidatesClientProps) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await addCandidate(fd);
    setAddLoading(false);
    if (result?.error) { setAddError(result.error); return; }
    setAddModalOpen(false);
    router.refresh();
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete candidate "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCandidate(id);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setAddModalOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      <div className="space-y-6">
        {positions.map((pos) => (
          <div key={pos.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">{pos.title}</h2>
              <span className="text-xs text-slate-500">
                {pos.candidates.length} candidate{pos.candidates.length !== 1 ? 's' : ''}
              </span>
            </div>
            {pos.candidates.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400 italic">No candidates yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {pos.candidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-sky-50/40 transition-colors">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                      {c.image_url ? (
                        <Image src={c.image_url} alt={c.full_name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <User className="h-5 w-5 absolute inset-0 m-auto text-slate-400" />
                      )}
                    </div>
                    <p className="flex-1 text-sm font-medium text-slate-900">{c.full_name}</p>
                    <button
                      onClick={() => handleDelete(c.id, c.full_name)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label={`Delete ${c.full_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Candidate">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-800 block" htmlFor="add-position">
              Position
            </label>
            <select id="add-position" name="position_id" required className={SELECT_CLS}>
              <option value="">— Select position —</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <Input id="add-name" name="full_name" label="Full Name" placeholder="e.g. Adewale Bakare" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-800 block" htmlFor="add-photo">
              Passport Photo
            </label>
            <input
              id="add-photo"
              name="photo"
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition file:bg-sky-50 file:border file:border-sky-300 file:text-sky-700 file:text-xs file:font-semibold file:px-3 file:py-1.5 file:rounded-md file:mr-3 hover:file:bg-sky-100"
            />
          </div>
          {addError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {addError}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" loading={addLoading} fullWidth>Add Candidate</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
