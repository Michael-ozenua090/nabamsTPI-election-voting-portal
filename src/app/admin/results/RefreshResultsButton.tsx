'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RefreshResultsButton() {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState('');

  function refresh() {
    router.refresh();
    setLastRefresh(new Date().toLocaleTimeString('en-NG'));
  }

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={refresh}>
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>
      {lastRefresh && <p className="text-xs text-gray-500">Last: {lastRefresh}</p>}
    </div>
  );
}
