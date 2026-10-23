// Client Component (clickable citation pill with hover tooltip and click handler)
'use client';

import React, { useState } from 'react';
import { Citation, PdfDocument } from '@/lib/types';

interface CitationPillProps {
  index: number;
  citation?: Citation;
  document?: PdfDocument;
  onClick?: (page: number, docId?: string) => void;
}

export function CitationPill({
  index,
  citation,
  document,
  onClick,
}: CitationPillProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const page = citation?.page || index;
  const docTitle = document?.title || (citation?.docId ? `Document (${citation.docId})` : 'Document');

  return (
    <span className="relative inline-block align-baseline mx-0.5">
      <button
        type="button"
        onClick={() => onClick?.(page, citation?.docId)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center justify-center min-w-[20px] h-[19px] px-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/80 rounded-md cursor-pointer transition-all active:scale-95 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
        aria-label={`Citation ${index}: Page ${page} of ${docTitle}`}
      >
        {index}
      </button>

      {/* Hover tooltip */}
      {showTooltip && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 text-[10px] font-medium text-white bg-zinc-900 rounded-md shadow-md whitespace-nowrap z-50 pointer-events-none transition-opacity"
        >
          Page {page} · {docTitle}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
        </span>
      )}
    </span>
  );
}
