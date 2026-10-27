"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PdfDocument } from "@/lib/types";
import { createChatAction } from "@/app/actions/chats";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { FiSearch, FiFileText, FiCheck, FiMessageSquare } from "react-icons/fi";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDocuments: PdfDocument[];
}

export function NewChatModal({
  isOpen,
  onClose,
  availableDocuments,
}: NewChatModalProps) {
  const [search, setSearch] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const { toast } = useToast();

  const readyDocs = availableDocuments.filter((d) => d.status === "ready");
  const filteredDocs = readyDocs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds((prev) => prev.filter((d) => d !== id));
    } else {
      if (selectedDocIds.length >= 5) {
        toast({
          type: "error",
          title: "Limit reached",
          description: "A maximum of 5 documents can be selected per chat.",
        });
        return;
      }
      setSelectedDocIds((prev) => [...prev, id]);
    }
  };

  const handleCreate = () => {
    if (selectedDocIds.length === 0) return;

    startTransition(async () => {
      const res = await createChatAction(selectedDocIds);

      if (res.success === true && res.data) {
        toast({
          type: "success",
          title: "Chat started",
          description: "Conversation initialized with selected documents.",
        });

        onClose();
        router.push(`/chats/${res.data.id}`);
      } else if (res.success === false) {
        toast({
          type: "error",
          title: "Failed to create chat",
          description: res.error,
        });
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start a new chat"
      description="Select 1 to 5 ready documents to cross-reference and ask questions."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          />
        </div>

        {/* Document list */}
        <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-zinc-100">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              {readyDocs.length === 0
                ? "No ready documents available. Upload a PDF first."
                : "No documents match your search."}
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <div
                  key={doc.id}
                  onClick={() => toggleSelect(doc.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-indigo-50/70 border border-indigo-200"
                      : "hover:bg-zinc-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-4 h-4 rounded border border-zinc-300 flex items-center justify-center shrink-0">
                      {isSelected && (
                        <div className="w-full h-full bg-indigo-600 rounded flex items-center justify-center text-white">
                          <FiCheck className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <FiFileText className="w-4 h-4 text-zinc-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-900 truncate">
                        {doc.title}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {doc.pageCount} pages
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-xs text-zinc-500">
            {selectedDocIds.length} of 5 selected
          </span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={selectedDocIds.length === 0}
              isLoading={isPending}
              onClick={handleCreate}
              leftIcon={<FiMessageSquare className="w-3.5 h-3.5" />}
            >
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
