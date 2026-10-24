// Client Component (scrollable page list with toolbar, zoom and scroll/page sync; renders mock pages for now)
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  FiChevronDown,
  FiChevronUp,
  FiMaximize2,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";

// REPLACE INTERNALS WITH react-pdf, KEEP THIS PROPS CONTRACT
interface PdfViewerProps {
  fileUrl: string;
  pageCount: number;
  currentPage: number;
  highlightPage?: number;
  onPageChange: (page: number) => void;
}

const BASE_PAGE_WIDTH = 560; // px at 100% zoom
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;
const LINE_WIDTHS = [96, 100, 88, 100, 78, 94, 100, 66];

function MockPageContent({ page }: { page: number }) {
  const lineWidth = (index: number) =>
    LINE_WIDTHS[(page * 3 + index) % LINE_WIDTHS.length];

  return (
    <div className="flex h-full flex-col gap-3 p-[9%]">
      <div className="h-4 w-2/3 rounded bg-zinc-300" />
      <div className="h-2.5 w-1/3 rounded bg-zinc-200" />
      <div className="mt-2 space-y-2">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i}
            className="h-2 rounded bg-zinc-200"
            style={{ width: `${lineWidth(i)}%` }}
          />
        ))}
      </div>
      {page % 3 === 0 && (
        <div className="my-2 h-1/5 rounded-lg bg-zinc-100 ring-1 ring-zinc-200" />
      )}
      <div className="space-y-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="h-2 rounded bg-zinc-200"
            style={{ width: `${lineWidth(i + 4)}%` }}
          />
        ))}
      </div>
      <span className="mt-auto self-center text-[11px] font-medium text-zinc-400">
        {page}
      </span>
    </div>
  );
}

export function PdfViewer({
  pageCount,
  currentPage,
  highlightPage,
  onPageChange,
}: PdfViewerProps) {
  const [zoom, setZoom] = useState<number | "fit">("fit");

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const observedPageRef = useRef(1); // last page we reported from the user's own scrolling
  const ignoreObserverUntilRef = useRef(0); // pause page tracking during programmatic scrolls
  const isFirstScrollRef = useRef(true);
  const onPageChangeRef = useRef(onPageChange);

  const totalPages = Math.max(pageCount, 1);
  const page = Math.min(Math.max(currentPage, 1), totalPages);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  });

  // Page requested from outside (citation click, prev/next, page input): scroll
  // THIS container to it. Never use scrollIntoView, it would scroll the whole page.
  useEffect(() => {
    if (page === observedPageRef.current && !isFirstScrollRef.current) return;

    const container = scrollRef.current;
    const element = pageRefs.current[page];
    if (!container || !element) return;

    ignoreObserverUntilRef.current = Date.now() + 800;
    container.scrollTo({
      top: Math.max(0, element.offsetTop - 12),
      behavior: isFirstScrollRef.current ? "auto" : "smooth",
    });

    observedPageRef.current = page;
    isFirstScrollRef.current = false;
  }, [page]);

  // The user scrolls by hand: report which page is most visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const visibleRatios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const pageNumber = Number((entry.target as HTMLElement).dataset.page);
          visibleRatios.set(pageNumber, entry.intersectionRatio);
        }

        if (Date.now() < ignoreObserverUntilRef.current) return;

        let bestPage = 0;
        let bestRatio = 0;
        visibleRatios.forEach((ratio, pageNumber) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPage = pageNumber;
          }
        });

        if (bestPage && bestPage !== observedPageRef.current) {
          observedPageRef.current = bestPage;
          onPageChangeRef.current(bestPage);
        }
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (let n = 1; n <= totalPages; n++) {
      const element = pageRefs.current[n];
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [totalPages, zoom]);

  const zoomBy = (delta: number) => {
    const base = zoom === "fit" ? 1 : zoom;
    setZoom(
      Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Math.round((base + delta) * 100) / 100),
      ),
    );
  };

  const commitPageInput = (input: HTMLInputElement) => {
    const requested = Number.parseInt(input.value, 10);
    if (Number.isNaN(requested)) {
      input.value = String(page);
      return;
    }
    const next = Math.min(Math.max(requested, 1), totalPages);
    input.value = String(next);
    if (next !== page) onPageChange(next);
  };

  const pageWidth =
    zoom === "fit" ? "100%" : `${Math.round(BASE_PAGE_WIDTH * zoom)}px`;
  const toolbarButton =
    "rounded-lg p-1.5 text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-zinc-100">
      {/* Toolbar: never scrolls */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={toolbarButton}
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <FiChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={toolbarButton}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <FiChevronDown className="h-4 w-4" />
          </button>
          <div className="ml-1 flex items-center gap-1.5 text-xs text-zinc-500">
            <input
              key={page}
              type="number"
              min={1}
              max={totalPages}
              defaultValue={page}
              onBlur={(e) => commitPageInput(e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitPageInput(e.currentTarget);
              }}
              aria-label="Page number"
              className="w-12 rounded-lg border border-zinc-200 px-1.5 py-1 text-center text-xs text-zinc-800 [appearance:textfield] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span>/ {totalPages}</span>
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={toolbarButton}
            onClick={() => zoomBy(-ZOOM_STEP)}
            disabled={zoom !== "fit" && zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <FiZoomOut className="h-4 w-4" />
          </button>
          <span className="w-11 text-center text-xs tabular-nums text-zinc-500">
            {zoom === "fit" ? "Fit" : `${Math.round(zoom * 100)}%`}
          </span>
          <button
            type="button"
            className={toolbarButton}
            onClick={() => zoomBy(ZOOM_STEP)}
            disabled={zoom !== "fit" && zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <FiZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={toolbarButton}
            onClick={() => setZoom("fit")}
            aria-label="Fit to width"
          >
            <FiMaximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* The ONLY scroller for the pages. min-h-0 + flex-1 + overflow-auto is what keeps
          the 21 pages inside this panel instead of stretching the whole page. */}
      <div
        ref={scrollRef}
        role="region"
        aria-label="PDF pages"
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain p-4"
      >
        <div className="space-y-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              data-page={n}
              ref={(element) => {
                pageRefs.current[n] = element;
              }}
              style={{ width: pageWidth }}
              className={`mx-auto aspect-[1/1.414] overflow-hidden bg-white shadow-sm ring-1 transition-shadow duration-300 ${
                highlightPage === n
                  ? "ring-4 ring-indigo-500/70"
                  : "ring-zinc-200"
              }`}
            >
              <MockPageContent page={n} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
