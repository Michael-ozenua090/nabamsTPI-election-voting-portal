'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { addCandidate, updateCandidate, deleteCandidate, disqualifyCandidate, reinstateCandidate } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Trash2, PlusCircle, User, Edit2, Ban, CheckCircle } from 'lucide-react';
import type { Candidate, Position } from '@/types/database';

const SELECT_CLS =
  'w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition';

interface CandidatesClientProps {
  positions: (Position & { candidates: Candidate[] })[];
}

export function CandidatesClient({ positions }: CandidatesClientProps) {
  const router = useRouter();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [disqualifyModalOpen, setDisqualifyModalOpen] = useState(false);
  
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await addCandidate(fd);
    setActionLoading(false);
    if (result?.error) { setActionError(result.error); return; }
    setAddModalOpen(false);
    router.refresh();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCandidate) return;
    setActionError('');
    setActionLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.append('id', selectedCandidate.id);
    const result = await updateCandidate(fd);
    setActionLoading(false);
    if (result?.error) { setActionError(result.error); return; }
    setEditModalOpen(false);
    setSelectedCandidate(null);
    router.refresh();
  }

  async function handleDisqualify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCandidate) return;
    setActionError('');
    setActionLoading(true);
    const fd = new FormData(e.currentTarget);
    const reason = fd.get('reason') as string;
    const result = await disqualifyCandidate(selectedCandidate.id, reason);
    setActionLoading(false);
    if (result?.error) { setActionError(result.error); return; }
    setDisqualifyModalOpen(false);
    setSelectedCandidate(null);
    router.refresh();
  }

  function handleReinstate(id: string) {
    if (!confirm(`Reinstate candidate?`)) return;
    startTransition(async () => {
      await reinstateCandidate(id);
      router.refresh();
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete candidate "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCandidate(id);
      router.refresh();
    });
  }

  function openEdit(c: Candidate) {
    setSelectedCandidate(c);
    setActionError('');
    setEditModalOpen(true);
  }

  function openDisqualify(c: Candidate) {
    setSelectedCandidate(c);
    setActionError('');
    setDisqualifyModalOpen(true);
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
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{c.full_name}</p>
                      {c.is_disqualified && (
                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
                          Disqualified: {c.disqualification_reason}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {c.is_disqualified ? (
                        <button
                          onClick={() => handleReinstate(c.id)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Reinstate Candidate"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openDisqualify(c)}
                          disabled={isPending}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Disqualify Candidate"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(c)}
                        disabled={isPending}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        title="Edit Candidate"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.full_name)}
                        disabled={isPending}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Delete ${c.full_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition file:bg-sky-50 file:border file:border-sky-300 file:text-sky-700 file:text-xs file:font-semibold file:px-3 file:py-1.5 file:rounded-md file:mr-3 hover:file:bg-sky-100"
            />
          </div>
          {actionError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {actionError}
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)} fullWidth>Cancel</Button>
            <Button type="submit" loading={actionLoading} fullWidth>Add Candidate</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Candidate Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Candidate">
        {selectedCandidate && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-800 block" htmlFor="edit-position">
                Position
              </label>
              <select id="edit-position" name="position_id" defaultValue={selectedCandidate.position_id} required className={SELECT_CLS}>
                <option value="">— Select position —</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <Input id="edit-name" name="full_name" label="Full Name" defaultValue={selectedCandidate.full_name} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-800 block" htmlFor="edit-photo">
                Replace Passport Photo (Optional)
              </label>
              <input
                id="edit-photo"
                name="photo"
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition file:bg-sky-50 file:border file:border-sky-300 file:text-sky-700 file:text-xs file:font-semibold file:px-3 file:py-1.5 file:rounded-md file:mr-3 hover:file:bg-sky-100"
              />
            </div>
            {actionError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {actionError}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={() => setEditModalOpen(false)} fullWidth>Cancel</Button>
              <Button type="submit" loading={actionLoading} fullWidth>Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Disqualify Candidate Modal */}
      <Modal open={disqualifyModalOpen} onClose={() => setDisqualifyModalOpen(false)} title="Disqualify Candidate">
        {selectedCandidate && (
          <form onSubmit={handleDisqualify} className="space-y-4">
            <p className="text-sm text-slate-600">
              Disqualifying <strong>{selectedCandidate.full_name}</strong> will prevent voters from casting ballots for them.
            </p>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-800 block" htmlFor="disqualify-reason">
                Reason for Disqualification
              </label>
              <textarea
                id="disqualify-reason"
                name="reason"
                required
                rows={3}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500"
                placeholder="e.g. Screening failure, by-law violation..."
              />
            </div>
            {actionError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {actionError}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" type="button" onClick={() => setDisqualifyModalOpen(false)} fullWidth>Cancel</Button>
              <Button type="submit" loading={actionLoading} className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600" fullWidth>Confirm Disqualify</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
