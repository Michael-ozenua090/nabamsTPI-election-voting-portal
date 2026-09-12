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
          <div key={pos.id} className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-3 flex items-center justify-between">
              <h2 className="font-bold text-white text-sm">{pos.title}</h2>
              <span className="text-xs text-gray-500">{pos.candidates.length} candidate{pos.candidates.length !== 1 ? 's' : ''}</span>
            </div>
            {pos.candidates.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-500 italic">No candidates yet.</p>
            ) : (
              <div className="divide-y divide-white/8">
                {pos.candidates.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-white/10">
                      {c.image_url ? (
                        <Image src={c.image_url} alt={c.full_name} fill className="object-cover" sizes="40px" />
                      ) : (
                        <User className="h-5 w-5 absolute inset-0 m-auto text-gray-500" />
                      )}
                    </div>
                    <p className="flex-1 text-sm font-medium text-white">{c.full_name}</p>
                    <button
                      onClick={() => handleDelete(c.id, c.full_name)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
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
            <label className="text-sm font-medium text-gray-300" htmlFor="add-position">Position</label>
            <select id="add-position" name="position_id" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nabams-green">
              <option value="">— Select position —</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <Input id="add-name" name="full_name" label="Full Name" placeholder="e.g. Adewale Bakare" required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300" htmlFor="add-photo">Passport Photo</label>
            <input id="add-photo" name="photo" type="file" accept="image/*" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-nabams-green/30 file:px-3 file:py-1 file:text-xs file:text-green-200 hover:file:bg-nabams-green/50" />
          </div>
          {addError && <p className="text-sm text-red-400">{addError}</p>}
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" loading={addLoading} fullWidth>Add Candidate</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
