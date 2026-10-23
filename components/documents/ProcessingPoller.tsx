// Client Component (polls router.refresh every 3s while any document is processing)
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProcessingPollerProps {
  hasProcessing: boolean;
}

export function ProcessingPoller({ hasProcessing }: ProcessingPollerProps) {
  const router = useRouter();

  useEffect(() => {
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [hasProcessing, router]);

  return null;
}
