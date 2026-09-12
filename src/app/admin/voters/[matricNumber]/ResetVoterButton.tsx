'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { resetVoter } from '@/app/actions/admin';
import { Button } from '@/components/ui/Button';
import { RotateCcw } from 'lucide-react';

export function ResetVoterButton({ matricNumber }: { matricNumber: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReset() {
    if (
      !confirm(
        'Are you sure you want to re-enable voting for this student? (Note: Due to ballot secrecy, their previous vote remains anonymous in the general tally).'
      )
    ) {
      return;
    }

    startTransition(async () => {
      await resetVoter(matricNumber);
      router.refresh();
    });
  }

  return (
    <Button
      variant="danger"
      onClick={handleReset}
      loading={isPending}
      className="flex items-center gap-2"
    >
      <RotateCcw className="h-4 w-4" /> Reset Voting Status
    </Button>
  );
}
