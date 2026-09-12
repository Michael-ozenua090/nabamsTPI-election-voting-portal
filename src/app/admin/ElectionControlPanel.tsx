'use client';

import { useState, useTransition } from 'react';
import { setElectionStatus } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, Lock, RotateCcw } from 'lucide-react';
import type { ElectionStatus } from '@/types/database';

export function ElectionControlPanel({ currentStatus }: { currentStatus: string }) {
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

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white">Election Control</h2>
        <Badge variant={statusVariant[status] ?? 'gray'}>{status.toUpperCase()}</Badge>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" size="sm" loading={isPending} onClick={() => changeStatus('open')} disabled={status === 'open'}><Play className="h-4 w-4" />Open Polls</Button>
        <Button variant="outline" size="sm" loading={isPending} onClick={() => changeStatus('paused')} disabled={status === 'paused'}><Pause className="h-4 w-4" />Pause</Button>
        <Button variant="danger" size="sm" loading={isPending} onClick={() => changeStatus('closed')} disabled={status === 'closed'}><Lock className="h-4 w-4" />Close Election</Button>
        <Button variant="ghost" size="sm" loading={isPending} onClick={() => changeStatus('pending')} disabled={status === 'pending'}><RotateCcw className="h-4 w-4" />Reset to Pending</Button>
      </div>
      <p className="text-xs text-gray-500">Current status: <strong className="text-gray-300">{status}</strong>. Only "open" allows ballot submissions.</p>
    </div>
  );
}
