'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { flagVoter, unflagVoter } from '@/app/actions/admin';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface FlagVoterButtonProps {
  matricNumber: string;
  isFlagged: boolean;
}

export function FlagVoterButton({ matricNumber, isFlagged }: FlagVoterButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A reason is required.');
      return;
    }
    setError('');
    
    startTransition(async () => {
      const result = await flagVoter(matricNumber, reason);
      if (result.error) {
        setError(result.error);
      } else {
        setModalOpen(false);
        setReason('');
      }
    });
  }

  async function handleUnflag() {
    if (!confirm('Are you sure you want to reactivate this voter?')) return;
    
    startTransition(async () => {
      await unflagVoter(matricNumber);
    });
  }

  if (isFlagged) {
    return (
      <Button 
        variant="outline"
        className="!text-emerald-700 !border-emerald-300 hover:!bg-emerald-50"
        onClick={handleUnflag}
        disabled={isPending}
      >
        <CheckCircle className="h-4 w-4 mr-2" /> Reactivate Voter
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="!text-red-700 !border-red-300 hover:!bg-red-50"
        onClick={() => setModalOpen(true)}
      >
        <AlertTriangle className="h-4 w-4 mr-2" /> Flag / Suspend Voter
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Flag Voter">
        <form onSubmit={handleFlag} className="space-y-4">
          <p className="text-sm text-slate-600">
            Flagging this voter will immediately suspend their account and prevent them from voting.
          </p>
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Reason for Flagging
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500"
              placeholder="e.g. Uploaded selfie instead of student ID card."
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isPending} className="!bg-red-600 hover:!bg-red-700 !text-white !border-red-600">
              Confirm Suspend
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
