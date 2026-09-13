'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addAdjustment } from '@/app/actions/admin';
import type { Candidate, Position } from '@/types/database';

const SELECT_CLS =
  'w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition';

const LABEL_CLS = 'text-sm font-semibold text-slate-800 block mb-1.5';

interface AdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  positions: (Position & { candidates: Candidate[] })[];
}

export function AdjustmentModal({ open, onClose, positions }: AdjustmentModalProps) {
  const [candidateId, setCandidateId] = useState('');
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!candidateId || !delta || !reason.trim()) {
      setError('All fields are required.');
      return;
    }
    const deltaNum = parseInt(delta, 10);
    if (isNaN(deltaNum) || deltaNum === 0) {
      setError('Delta must be a non-zero integer (positive or negative).');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters.');
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.set('candidate_id', candidateId);
    fd.set('delta', delta);
    fd.set('reason', reason.trim());

    const result = await addAdjustment(fd);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCandidateId('');
        setDelta('');
        setReason('');
        onClose();
      }, 1200);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Vote Adjustment">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Candidate selector */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLS} htmlFor="adj-candidate">
            Candidate
          </label>
          <select
            id="adj-candidate"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            required
            className={SELECT_CLS}
          >
            <option value="">— Select candidate —</option>
            {positions.map((pos) =>
              pos.candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({pos.title})
                </option>
              ))
            )}
          </select>
        </div>

        {/* Delta */}
        <Input
          id="adj-delta"
          label="Vote Adjustment (positive or negative integer)"
          type="number"
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="e.g. -3 or +5"
          required
        />

        {/* Reason */}
        <div className="flex flex-col gap-1.5">
          <label className={LABEL_CLS} htmlFor="adj-reason">
            Reason (mandatory)
          </label>
          <textarea
            id="adj-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            minLength={10}
            placeholder="e.g. Electoral sanction for hall coercion — approved by HOD"
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 text-slate-900 text-sm rounded-lg shadow-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100 transition resize-none"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-xs text-sky-800">
            ✓ Adjustment recorded successfully.
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" type="button" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="danger" type="submit" loading={loading} fullWidth>
            Record Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
