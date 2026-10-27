// Client Component (interactive message item with copy feedback, sources row, and citation triggers)
"use client";

import React, { useState } from "react";
import { Message, PdfDocument } from "@/lib/types";
import { formatTime } from "@/lib/format";
import { MarkdownContent } from "./MarkdownContent";
import { FiCopy, FiCheck, FiSearch, FiFileText, FiInfo } from "react-icons/fi";

interface MessageItemProps {
  message: Message;
  documents?: PdfDocument[];
  onCitationClick: (page: number, docId?: string) => void;
  isStreaming?: boolean;
}

export function MessageItem({
  message,
  documents = [],
  onCitationClick,
  isStreaming = false,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";
  const isNotFound =
    !isUser && message.content.includes("I couldn't find anything relevant");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-indigo-600 text-white px-4 py-2.5 shadow-xs space-y-1">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          <div className="flex justify-end text-[10px] text-indigo-200">
            <span>{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  // "Not found" response style
  if (isNotFound) {
    return (
      <div className="flex flex-col w-full space-y-2">
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-100/70 border border-zinc-200 text-zinc-700">
          <div className="p-1 rounded-lg bg-zinc-200 text-zinc-600 shrink-0 mt-0.5">
            <FiSearch className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-900">
              No matching content found
            </p>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
        <div className="text-[10px] text-zinc-400 pl-1">
          {formatTime(message.createdAt)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full space-y-3">
      {/* Assistant Markdown Content */}
      <div className="w-full bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <MarkdownContent
          content={message.content}
          citations={message.citations}
          documents={documents}
          onCitationClick={onCitationClick}
          isStreaming={isStreaming}
        />

        {/* Sources Row */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <FiInfo className="w-3 h-3" />
              Sources:
            </span>
            {message.citations.map((c) => {
              const doc = documents.find((d) => d.id === c.docId);
              return (
                <button
                  key={`${c.docId}-${c.page}-${c.index}`}
                  type="button"
                  onClick={() => onCitationClick(c.page, c.docId)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-zinc-200 transition-colors text-zinc-700 cursor-pointer"
                >
                  <FiFileText className="w-3 h-3 text-zinc-400" />
                  <span className="font-semibold text-indigo-600">
                    [{c.index}]
                  </span>
                  <span>Page {c.page}</span>
                  {doc && (
                    <span className="text-zinc-400 truncate max-w-[120px]">
                      · {doc.title}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Meta & Copy Button */}
      <div className="w-full flex items-center justify-between text-xs text-zinc-400 px-1">
        <span className="text-[11px]">{formatTime(message.createdAt)}</span>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copied text to clipboard" : "Copy message text"}
          className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-1 rounded-md hover:bg-zinc-100 cursor-pointer"
        >
          {copied ? (
            <>
              <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Copied</span>
            </>
          ) : (
            <>
              <FiCopy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
