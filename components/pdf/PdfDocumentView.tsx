// Client Component (renders the real PDF with react-pdf: scrollable pages, zoom, page sync, lazy page rendering)
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FiAlertCircle,
  FiChevronDown,
  FiChevronUp,
  FiMaximize2,
  FiRefreshCw,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";
import { getDocumentUrlAction } from "@/app/actions/documents";

// react-pdf needs PDF.js's worker. It must be set in THIS file, the one that
// renders <Document> and <Page>.
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export interface PdfDocumentViewProps {
  documentId: string;
  pageCount: number; // from the API; used until the PDF reports its own page count
  currentPage: number;
  highlightPage?: number;
  onPageChange: (page: number) => void;
}

const BASE_PAGE_WIDTH = 560; // px at 100% zoom
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.25;
const FALLBACK_RATIO = 1.414; // A4 height / width, used until the real size is known

// Defined outside the component so react-pdf doesn't think the options changed
// on every render. The whole file is downloaded in one request (these PDFs are
// at most 10 MB), which also keeps the bucket's CORS rule simple.
const documentOptions = { disableRange: true, disableStream: true };

// Signed links last about an hour; reuse one for 45 minutes
const URL_TTL_MS = 45 * 60 * 1000;
const urlCache = new Map<string, { url: string; expiresAt: number }>();

async function loadUrl(
  documentId: string,
  forceFresh: boolean,
): Promise<string> {
  const cached = urlCache.get(documentId);
  if (!forceFresh && cached && cached.expiresAt > Date.now()) return cached.url;

  const result = await getDocumentUrlAction(documentId);
  if (!result.success) throw new Error(result.error);
  if (!result.data) throw new Error("The server did not return a PDF link.");

  urlCache.set(documentId, {
    url: result.data.url,
    expiresAt: Date.now() + URL_TTL_MS,
  });
  return result.data.url;
}

type Source =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-48 items-center justify-center gap-2 text-xs text-zinc-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
      {label}
    </div>
  );
}

export function PdfDocumentView({
  documentId,
  pageCount,
  currentPage,
  highlightPage,
  onPageChange,
}: PdfDocumentViewProps) {
  const [source, setSource] = useState<Source>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [defaultRatio, setDefaultRatio] = useState(FALLBACK_RATIO);
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const [nearPages, setNearPages] = useState<ReadonlySet<number>>(new Set());
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoom, setZoom] = useState<number | "fit">("fit");

  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const autoRetriedRef = useRef(false);
  const observedPageRef = useRef(1); // last page we reported from the user's own scrolling
  const ignoreObserverUntilRef = useRef(0); // pause page tracking during programmatic scrolls
  const isFirstScrollRef = useRef(true);
  const onPageChangeRef = useRef(onPageChange);

  const totalPages = Math.max(numPages ?? pageCount, 1);
  const page = Math.min(Math.max(currentPage, 1), totalPages);

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  });

  // 1) Ask the server for a temporary link to this document's PDF
  useEffect(() => {
    let cancelled = false;

    loadUrl(documentId, attempt > 0)
      .then((url) => {
        if (!cancelled) setSource({ status: "ready", url });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSource({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Could not load the PDF.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [documentId, attempt]);

  const retry = () => {
    setNumPages(null);
    setSource({ status: "loading" });
    setAttempt((value) => value + 1);
  };

  const handleLoadSuccess = async (pdf: {
    numPages: number;
    getPage: (
      n: number,
    ) => Promise<{
      getViewport: (o: { scale: number }) => { width: number; height: number };
    }>;
  }) => {
    autoRetriedRef.current = false;

    // Measure page 1 first so every placeholder already has about the right height
    try {
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      if (viewport.width > 0) setDefaultRatio(viewport.height / viewport.width);
    } catch {
      // keep the A4 fallback
    }

    setNumPages(pdf.numPages);
  };

  const handleLoadError = (error: Error) => {
    console.error("[pdf] failed to load the document:", error);

    // The signed link may simply have expired: fetch a fresh one, once
    if (!autoRetriedRef.current) {
      autoRetriedRef.current = true;
      retry();
      return;
    }

    setSource({
      status: "error",
      message:
        "The PDF could not be loaded. If this keeps happening, check that the storage bucket allows requests from this site (CORS).",
    });
  };

  const handlePageLoaded = (
    n: number,
    originalWidth: number,
    originalHeight: number,
  ) => {
    if (originalWidth <= 0) return;
    const ratio = originalHeight / originalWidth;
    setRatios((previous) =>
      Math.abs((previous[n] ?? 0) - ratio) < 0.001
        ? previous
        : { ...previous, [n]: ratio },
    );
  };

  // 2) Measure the scroll area so "fit to width" knows how wide a page can be
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // 3) Only pages near the screen get a real <Page>; the rest are empty
  //    placeholders of the right size, so a 100-page PDF stays fast
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || numPages === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setNearPages((previous) => {
          const next = new Set(previous);
          for (const entry of entries) {
            const n = Number((entry.target as HTMLElement).dataset.page);
            if (entry.isIntersecting) next.add(n);
            else next.delete(n);
          }
          return next;
        });
      },
      { root: container, rootMargin: "150% 0px" },
    );

    for (let n = 1; n <= numPages; n++) {
      const element = pageRefs.current[n];
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [numPages]);

  // 4) A page was requested from outside (citation click, prev/next, page input):
  //    scroll THIS container to it. Never scrollIntoView, it scrolls the whole page.
  useEffect(() => {
    if (numPages === null) return;
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
  }, [page, numPages]);

  // 5) The user scrolls by hand: report which page is most visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || numPages === null) return;

    const visibleRatios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const n = Number((entry.target as HTMLElement).dataset.page);
          visibleRatios.set(n, entry.intersectionRatio);
        }

        if (Date.now() < ignoreObserverUntilRef.current) return;

        let bestPage = 0;
        let bestRatio = 0;
        visibleRatios.forEach((ratio, n) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestPage = n;
          }
        });

        if (bestPage && bestPage !== observedPageRef.current) {
          observedPageRef.current = bestPage;
          onPageChangeRef.current(bestPage);
        }
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (let n = 1; n <= numPages; n++) {
      const element = pageRefs.current[n];
      if (element) observer.observe(element);
    }

    return () => observer.disconnect();
  }, [numPages]);

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

  const pagePx =
    zoom === "fit"
      ? containerWidth > 0
        ? Math.max(240, containerWidth)
        : BASE_PAGE_WIDTH
      : Math.round(BASE_PAGE_WIDTH * zoom);

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

      {/* The ONLY scroller for the pages. scrollbar-gutter keeps the page width
          from changing when the scrollbar appears. */}
      <div
        ref={scrollRef}
        role="region"
        aria-label="PDF pages"
        className="relative min-h-0 flex-1 overflow-auto overscroll-contain p-4 [scrollbar-gutter:stable]"
      >
        {source.status === "error" ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
            <FiAlertCircle className="h-6 w-6 text-red-500" />
            <p className="max-w-xs text-xs leading-relaxed text-zinc-600">
              {source.message}
            </p>
            <button
              type="button"
              onClick={() => {
                autoRetriedRef.current = false;
                retry();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <FiRefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        ) : source.status === "loading" ? (
          <LoadingState label="Getting the PDF…" />
        ) : (
          <Document
            file={source.url}
            options={documentOptions}
            suspense={false}
            loading={<LoadingState label="Loading PDF…" />}
            error={<LoadingState label="Loading PDF…" />}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
          >
            {numPages !== null && (
              <div className="space-y-4">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
                  <div
                    key={n}
                    data-page={n}
                    ref={(element) => {
                      pageRefs.current[n] = element;
                    }}
                    style={{
                      width: pagePx,
                      height: Math.round(pagePx * (ratios[n] ?? defaultRatio)),
                    }}
                    className={`mx-auto overflow-hidden bg-white shadow-sm ring-1 transition-shadow duration-300 ${
                      highlightPage === n
                        ? "ring-4 ring-indigo-500/70"
                        : "ring-zinc-200"
                    }`}
                  >
                    {nearPages.has(n) ? (
                      <Page
                        pageNumber={n}
                        width={pagePx}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={<LoadingState label="" />}
                        onLoadSuccess={(loaded) =>
                          handlePageLoaded(
                            n,
                            loaded.originalWidth,
                            loaded.originalHeight,
                          )
                        }
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-zinc-300">
                        {n}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Document>
        )}
      </div>
    </div>
  );
}
