// Client Component (interactive documents page manager with selection, pagination, and upload modal)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PdfDocument, Pagination } from "@/lib/types";
import { UploadDropzone } from "./UploadDropzone";
import { DocumentRow } from "./DocumentRow";
import { MultiSelectActionBar } from "./MultiSelectActionBar";
import { ProcessingPoller } from "./ProcessingPoller";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
} from "react-icons/fi";

interface DocumentsWorkspaceProps {
  documents: PdfDocument[];
  pagination: Pagination;
}

export function DocumentsWorkspace({
  documents,
  pagination,
}: DocumentsWorkspaceProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showUploadDropzone, setShowUploadDropzone] = useState(false);

  const hasProcessing = documents.some((d) => d.status === "processing");
  const totalCount = pagination.total;
  const isAtLimit = totalCount >= 5;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Background poller for auto-advancing processing items */}
      <ProcessingPoller hasProcessing={hasProcessing} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Documents
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your research papers, contracts, and briefs for AI analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Document quota counter */}
          <div className="text-xs text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-xl font-medium">
            <span className={isAtLimit ? "text-amber-600 font-semibold" : ""}>
              {totalCount} documents
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploadDropzone((prev) => !prev)}
            leftIcon={<FiPlus className="w-4 h-4" />}
          >
            {showUploadDropzone ? "Close upload" : "Upload PDF"}
          </Button>
        </div>
      </div>

      {/* Upload Dropzone collapsible area */}
      {showUploadDropzone && (
        <div className="animate-in fade-in duration-150">
          <UploadDropzone
            currentCount={totalCount}
            maxCount={5}
            isOpen={showUploadDropzone}
            onClose={() => setShowUploadDropzone(false)}
          />
        </div>
      )}

      {/* Documents List */}
      {documents.length === 0 ? (
        <EmptyState
          title="No documents uploaded yet"
          description="Upload your first PDF document (up to 10 MB and 100 pages) to start chatting with verified page-level citations."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowUploadDropzone(true)}
              leftIcon={<FiPlus className="w-4 h-4" />}
            >
              Upload your first PDF
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {/* Table Header on desktop */}
          <div className="hidden md:flex items-center justify-between py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <div className="flex items-center gap-6">
              <span>Document Details</span>
            </div>
            <div className="flex items-center gap-12 pr-2">
              <span>Actions</span>
            </div>
          </div>

          {documents.map((doc) => (
            <DocumentRow
              key={doc.id}
              document={doc}
              isSelected={selectedIds.includes(doc.id)}
              onToggleSelect={handleToggleSelect}
            />
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 px-2 text-xs text-zinc-500">
              <span>
                Showing page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/documents?page=${pagination.page - 1}`}
                  className={`p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors ${
                    pagination.page <= 1 ? "pointer-events-none opacity-40" : ""
                  }`}
                  aria-label="Previous page"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </Link>
                <Link
                  href={`/documents?page=${pagination.page + 1}`}
                  className={`p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors ${
                    pagination.page >= pagination.totalPages
                      ? "pointer-events-none opacity-40"
                      : ""
                  }`}
                  aria-label="Next page"
                >
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Bar for multi-document selection */}
      <MultiSelectActionBar
        selectedIds={selectedIds}
        onClear={handleClearSelection}
      />
    </div>
  );
}
