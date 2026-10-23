// Client Component (error boundary with retry trigger)
'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application boundary error:', error);
  }, [error]);

  return (
    <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4">
        <FiAlertTriangle className="w-6 h-6" />
      </div>

      <h2 className="text-lg font-bold text-zinc-900 mb-1">
        Something went wrong
      </h2>
      <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
        {error.message || 'An unexpected error occurred while processing your request.'}
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => reset()}
          leftIcon={<FiRefreshCw className="w-4 h-4" />}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
