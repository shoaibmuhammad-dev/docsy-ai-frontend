// Client Component (chat screen header with document switcher, mobile segmented tabs, and panel toggles)
'use client';

import React from 'react';
import { PdfDocument } from '@/lib/types';
import {
  FiMenu,
  FiFileText,
  FiColumns,
  FiChevronDown,
} from 'react-icons/fi';

interface ChatHeaderProps {
  title: string;
  documents: PdfDocument[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  isPdfVisible: boolean;
  onTogglePdf: () => void;
  onOpenMobileSidebar: () => void;
  mobileTab: 'chat' | 'pdf';
  onSelectMobileTab: (tab: 'chat' | 'pdf') => void;
  isDesktop: boolean;
}

export function ChatHeader({
  title,
  documents,
  activeDocId,
  onSelectDoc,
  isPdfVisible,
  onTogglePdf,
  onOpenMobileSidebar,
  mobileTab,
  onSelectMobileTab,
  isDesktop,
}: ChatHeaderProps) {
  const activeDoc = documents.find((d) => d.id === activeDocId) || documents[0];

  return (
    <div className="h-14 border-b border-zinc-200 bg-white px-4 flex items-center justify-between gap-3 shrink-0 select-none">
      {/* Left: Sidebar trigger + Title & Doc selector */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open chat history sidebar"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors shrink-0"
        >
          <FiMenu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
            {title}
          </h2>

          {/* Document chips / switcher */}
          {documents.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 shrink-0 pl-1">
              <span className="text-zinc-300">/</span>
              {documents.length === 1 ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs border border-zinc-200">
                  <FiFileText className="w-3 h-3 text-zinc-400" />
                  <span className="truncate max-w-[140px]">{activeDoc?.title}</span>
                </div>
              ) : (
                <div className="relative inline-flex items-center">
                  <select
                    value={activeDocId}
                    onChange={(e) => onSelectDoc(e.target.value)}
                    aria-label="Select active document to view in PDF viewer"
                    className="appearance-none pl-6 pr-7 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-medium border border-zinc-200 hover:border-zinc-300 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 truncate max-w-[160px]"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                  <FiFileText className="w-3 h-3 text-zinc-400 absolute left-2 pointer-events-none" />
                  <FiChevronDown className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Mobile Segmented Control or Desktop PDF toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {!isDesktop ? (
          <div className="flex items-center p-0.5 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => onSelectMobileTab('chat')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                mobileTab === 'chat'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => onSelectMobileTab('pdf')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                mobileTab === 'pdf'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              PDF View
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onTogglePdf}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              isPdfVisible
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
            aria-label={isPdfVisible ? 'Hide PDF panel' : 'Show PDF panel'}
          >
            <FiColumns className="w-3.5 h-3.5" />
            <span>{isPdfVisible ? 'Hide PDF' : 'Show PDF'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
