// Client Component (client-only wrapper: react-pdf needs the browser, so it is never rendered on the server)
"use client";

import dynamic from "next/dynamic";
import type { PdfDocumentViewProps } from "./PdfDocumentView";

export type PdfViewerProps = PdfDocumentViewProps;

// ssr: false keeps react-pdf and PDF.js out of the server render
const PdfDocumentView = dynamic(
  () => import("./PdfDocumentView").then((module) => module.PdfDocumentView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-zinc-500">
        Loading viewer…
      </div>
    ),
  },
);

export function PdfViewer(props: PdfViewerProps) {
  return <PdfDocumentView {...props} />;
}
