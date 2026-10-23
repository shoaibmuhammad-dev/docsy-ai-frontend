// Client Component (interactive mock PDF viewer with zoom, page navigation, and citation highlight rings)
// REPLACE INTERNALS WITH react-pdf, KEEP THIS PROPS CONTRACT
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
} from 'react-icons/fi';

export interface PdfViewerProps {
  fileUrl: string;
  pageCount: number;
  currentPage: number;
  highlightPage?: number;
  onPageChange: (page: number) => void;
}

export function PdfViewer({
  fileUrl,
  pageCount,
  currentPage,
  highlightPage,
  onPageChange,
}: PdfViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeHighlight, setActiveHighlight] = useState<number | undefined>(highlightPage);
  const [prevHighlight, setPrevHighlight] = useState<number | undefined>(highlightPage);

  // Derive active highlight during render when prop changes
  if (highlightPage !== prevHighlight) {
    setPrevHighlight(highlightPage);
    setActiveHighlight(highlightPage);
  }

  const [isEditingPage, setIsEditingPage] = useState(false);
  const [inputPage, setInputPage] = useState<string>('');
  const displayPage = isEditingPage ? inputPage : String(currentPage);

  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle citation highlight scroll and 2-second timeout
  useEffect(() => {
    if (highlightPage) {
      const el = pageRefs.current.get(highlightPage);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const timer = setTimeout(() => {
        setActiveHighlight(undefined);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightPage]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleFitWidth = () => {
    setZoomLevel(100);
    const el = pageRefs.current.get(currentPage);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Page input submission
  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingPage(false);
    const parsed = parseInt(inputPage, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= pageCount) {
      onPageChange(parsed);
      const el = pageRefs.current.get(parsed);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const next = currentPage - 1;
      onPageChange(next);
      const el = pageRefs.current.get(next);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < pageCount) {
      const next = currentPage + 1;
      onPageChange(next);
      const el = pageRefs.current.get(next);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Generate pages array
  const pages = Array.from({ length: pageCount }, (_, idx) => idx + 1);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-100 border-l border-zinc-200 select-none">
      {/* Viewer Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-zinc-200 text-xs shrink-0 gap-2">
        {/* Pagination controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="p-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <span className="text-zinc-500">Page</span>
            <input
              type="text"
              value={displayPage}
              onFocus={() => {
                setIsEditingPage(true);
                setInputPage(String(currentPage));
              }}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={handlePageInputSubmit}
              className="w-10 px-1.5 py-0.5 text-center text-xs font-medium rounded-md border border-zinc-200 bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
              aria-label="Current page number"
            />
            <span className="text-zinc-500">of {pageCount}</span>
          </form>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= pageCount}
            aria-label="Next page"
            className="p-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 text-zinc-600">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            aria-label="Zoom out"
            className="p-1 rounded-lg hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>

          <span className="text-[11px] font-medium text-zinc-500 min-w-[36px] text-center">
            {zoomLevel}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            aria-label="Zoom in"
            className="p-1 rounded-lg hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
          >
            <FiZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-3.5 bg-zinc-200 mx-1" />

          <button
            type="button"
            onClick={handleFitWidth}
            aria-label="Fit to width"
            title="Fit to width"
            className="p-1 rounded-lg hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <FiMaximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pages Scrollable Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col items-center bg-zinc-200/60"
      >
        {pages.map((pageNum) => {
          const isHighlighted = activeHighlight === pageNum;

          return (
            <div
              key={pageNum}
              ref={(el) => {
                if (el) pageRefs.current.set(pageNum, el);
                else pageRefs.current.delete(pageNum);
              }}
              style={{
                width: `${Math.round(zoomLevel * 5.2)}px`,
                maxWidth: '100%',
              }}
              onClick={() => onPageChange(pageNum)}
              className={`relative bg-white shadow-md rounded-lg aspect-[1/1.414] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                isHighlighted
                  ? 'ring-4 ring-indigo-600 ring-offset-4 ring-offset-zinc-200 shadow-indigo-200/50 scale-[1.01]'
                  : 'hover:shadow-lg'
              }`}
            >
              {/* Highlight badge indicator */}
              {isHighlighted && (
                <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs animate-bounce">
                  Cited Page
                </div>
              )}

              {/* Mock document header */}
              <div className="border-b border-zinc-100 pb-3">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-400">
                  <span className="truncate max-w-[200px]">{fileUrl.split('/').pop()}</span>
                  <span>Document Section {Math.ceil(pageNum / 4)}</span>
                </div>
                <div className="h-3 w-2/3 bg-zinc-800 rounded mt-3" />
                <div className="h-2 w-1/3 bg-zinc-300 rounded mt-2" />
              </div>

              {/* Mock text body simulating document content */}
              <div className="space-y-3.5 py-4 flex-1">
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-zinc-200 rounded" />
                  <div className="h-2 w-[92%] bg-zinc-200 rounded" />
                  <div className="h-2 w-[96%] bg-zinc-200 rounded" />
                  <div className="h-2 w-[85%] bg-zinc-200 rounded" />
                </div>

                {/* Simulated visual diagram / table on certain pages */}
                {pageNum % 3 === 0 ? (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                    <div className="h-2 w-1/4 bg-indigo-200 rounded" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-8 bg-zinc-100 rounded border border-zinc-200" />
                      <div className="h-8 bg-zinc-100 rounded border border-zinc-200" />
                      <div className="h-8 bg-zinc-100 rounded border border-zinc-200" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-zinc-200 rounded" />
                    <div className="h-2 w-[90%] bg-zinc-200 rounded" />
                    <div className="h-2 w-[94%] bg-zinc-200 rounded" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="h-2 w-[88%] bg-zinc-200 rounded" />
                  <div className="h-2 w-[95%] bg-zinc-200 rounded" />
                  <div className="h-2 w-[70%] bg-zinc-200 rounded" />
                </div>
              </div>

              {/* Mock page footer */}
              <div className="border-t border-zinc-100 pt-3 flex items-center justify-between text-[10px] text-zinc-400">
                <span>Confidential Document</span>
                <span className="font-semibold text-zinc-600">Page {pageNum} of {pageCount}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
