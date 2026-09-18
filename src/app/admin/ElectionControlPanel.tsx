'use client';

import { useState, useTransition } from 'react';
import { setElectionStatus, toggleAccreditationLock } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, Lock, Unlock, RotateCcw } from 'lucide-react';
import type { ElectionStatus } from '@/types/database';

export function ElectionControlPanel({ currentStatus, isAccreditationLocked }: { currentStatus: string, isAccreditationLocked: boolean }) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function changeStatus(newStatus: ElectionStatus) {
    if (!confirm(`Set election status to "${newStatus}"?`)) return;
    startTransition(async () => {
      const result = await setElectionStatus(newStatus);
      if (result?.error) { setError(result.error); return; }
      setStatus(newStatus);
    });
  }

  const statusVariant: Record<string, 'green' | 'gold' | 'gray' | 'red'> = {
    open: 'green', paused: 'gold', closed: 'red', pending: 'gray',
  };

  async function handleToggleAccreditation() {
    if (!confirm(`Are you sure you want to ${isAccreditationLocked ? 'reopen' : 'lock'} accreditation?`)) return;
    startTransition(async () => {
      const result = await toggleAccreditationLock(!isAccreditationLocked);
      if (result?.error) { setError(result.error); }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-base">Election Control</h2>
        <Badge variant={statusVariant[status] ?? 'gray'}>{status.toUpperCase()}</Badge>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" loading={isPending} onClick={() => changeStatus('open')} disabled={status === 'open'}>
          <Play className="h-4 w-4" />Open Polls
        </Button>
        <Button variant="outline" size="sm" loading={isPending} onClick={() => changeStatus('paused')} disabled={status === 'paused'}>
          <Pause className="h-4 w-4" />Pause
        </Button>
        <Button variant="danger" size="sm" loading={isPending} onClick={() => changeStatus('closed')} disabled={status === 'closed'}>
          <Lock className="h-4 w-4" />Close Election
        </Button>
        <Button variant="ghost" size="sm" loading={isPending} onClick={() => changeStatus('pending')} disabled={status === 'pending'}>
          <RotateCcw className="h-4 w-4" />Reset to Pending
        </Button>
      </div>
      <p className="text-xs text-slate-500">
        Current status: <strong className="text-slate-800">{status}</strong>. Only "open" allows ballot submissions.
      </p>

      {/* Accreditation Control */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4 mt-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Accreditation Window</h3>
            {isAccreditationLocked ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                LOCKED / CLOSED
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                OPEN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAccreditationLocked
              ? 'Accreditation is closed. Only students who already completed accreditation can vote.'
              : 'Eligible students can still complete first-time accreditation and set their PIN.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleAccreditation}
          disabled={isPending}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 disabled:opacity-50 ${
            isAccreditationLocked
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {isAccreditationLocked ? (
            <><Unlock className="h-4 w-4" /> Reopen Accreditation</>
          ) : (
            <><Lock className="h-4 w-4" /> Lock Accreditation</>
          )}
        </button>
      </div>

    </div>
  );
}
