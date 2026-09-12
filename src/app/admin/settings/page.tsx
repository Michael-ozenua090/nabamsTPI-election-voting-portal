'use client';

import { useState, useTransition } from 'react';
import { clearTestData } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [confirm, setConfirm] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  function handleClear() {
    if (confirm !== 'CLEAR') {
      setResult({ error: 'Type CLEAR in the box to confirm.' });
      return;
    }
    startTransition(async () => {
      const r = await clearTestData();
      setResult(r ?? { success: true });
      setConfirm('');
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Settings &amp; Danger Zone</h1>
      <div className="rounded-2xl border-2 border-red-700/50 bg-red-900/10 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-red-300">Clear All Test Data</h2>
            <p className="mt-1 text-sm text-red-400/80">
              Permanently deletes ALL votes, resets every voter&apos;s has_voted flag to false,
              and removes all adjustments. Use only before the official election day.
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder='Type CLEAR to confirm'
            className="rounded-xl border border-red-700/50 bg-white/5 px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Button
            variant="danger"
            onClick={handleClear}
            loading={isPending}
            disabled={isPending || confirm !== 'CLEAR'}
          >
            <Trash2 className="h-4 w-4" />
            Wipe All Test Data
          </Button>
        </div>
        {result?.error && <p className="text-sm text-red-400">{result.error}</p>}
        {result?.success && <p className="text-sm text-green-400">\u2713 Test data cleared. Voter roll has been reset.</p>}
      </div>
    </div>
  );
}
