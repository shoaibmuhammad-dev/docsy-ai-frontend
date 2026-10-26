// Client Component (interactive document row with actions, selection, and confirm dialog)
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PdfDocument } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { deleteDocumentAction } from "@/app/actions/documents";
import { createChatAction } from "@/app/actions/chats";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import {
  FiFileText,
  FiMessageSquare,
  FiTrash2,
  FiAlertTriangle,
  FiCheck,
} from "react-icons/fi";

interface DocumentRowProps {
  document: PdfDocument;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export function DocumentRow({
  document: doc,
  isSelected,
  onToggleSelect,
}: DocumentRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartingChat, startChatTransition] = useTransition();

  const router = useRouter();
  const { toast } = useToast();

  const isReady = doc.status === "ready";
  const isFailed = doc.status === "failed";
  const isProcessing = doc.status === "processing";

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteDocumentAction(doc.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);

    if (res.success) {
      toast({
        type: "success",
        title: "Document deleted",
        description: `"${doc.title}" was removed.`,
      });
      router.refresh();
    } else {
      toast({
        type: "error",
        title: "Delete failed",
        description: res.error,
      });
    }
  };

  const handleStartChat = () => {
    startChatTransition(async () => {
      const res = await createChatAction([doc.id]);
      if (res.success && res.data) {
        toast({
          type: "success",
          title: "Chat created",
          description: `Ready to converse with ${doc.title}`,
        });
        router.push(`/chats/${res.data.id}`);
      } else {
        toast({
          type: "error",
          title: "Failed to start chat",
          description: res.error,
        });
      }
    });
  };

  return (
    <>
      <div
        className={`group relative flex flex-col md:flex-row md:items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-all gap-4 ${
          isSelected
            ? "ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/20"
            : ""
        }`}
      >
        {/* Document meta with selection checkbox */}
        <div className="flex items-start md:items-center gap-3.5 min-w-0 flex-1">
          {isReady ? (
            <div className="pt-0.5 md:pt-0 shrink-0">
              <label className="relative flex items-center justify-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(doc.id)}
                  aria-label={`Select document ${doc.title}`}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded-md border border-zinc-300 bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-600 peer-focus-visible:ring-offset-1 flex items-center justify-center text-white transition-colors">
                  {isSelected && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </label>
            </div>
          ) : (
            <div className="w-5 shrink-0" aria-hidden="true" />
          )}

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              isFailed
                ? "bg-red-50 text-red-600 border-red-200"
                : isProcessing
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-zinc-100 text-zinc-700 border-zinc-200"
            }`}
          >
            <FiFileText className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-zinc-900 truncate max-w-md">
                {doc.title}
              </h3>
              <Badge status={doc.status} />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
              <span>
                {doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"}
              </span>
              <span aria-hidden="true">·</span>
              <span>Uploaded {formatRelativeTime(doc.createdAt)}</span>
            </div>

            {isFailed && doc.errorMessage && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{doc.errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Row actions */}
        <div className="flex items-center gap-2 justify-end shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100">
          {isReady && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartChat}
              isLoading={isStartingChat}
              leftIcon={<FiMessageSquare className="w-3.5 h-3.5" />}
            >
              Chat
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label={`Delete ${doc.title}`}
            className="text-zinc-500 hover:text-red-600"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete document"
        message={`Are you sure you want to delete "${doc.title}"? Any linked chat threads will no longer have access to this document.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
      />
    </>
  );
}
