// Client Component (renders markdown with table support and interactive citation pills)
'use client';

import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Citation, PdfDocument } from '@/lib/types';
import { CitationPill } from './CitationPill';

interface MarkdownContentProps {
  content: string;
  citations?: Citation[];
  documents?: PdfDocument[];
  onCitationClick: (page: number, docId?: string) => void;
  isStreaming?: boolean;
}

export function MarkdownContent({
  content,
  citations = [],
  documents = [],
  onCitationClick,
  isStreaming = false,
}: MarkdownContentProps) {
  // Helper to replace [1], [2], etc. inside text nodes with CitationPill
  const renderTextWithCitations = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    if (parts.length === 1) return text;

    return parts.map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      if (match) {
        const citationIndex = parseInt(match[1], 10);
        const citation = citations.find((c) => c.index === citationIndex);
        const doc = citation ? documents.find((d) => d.id === citation.docId) : undefined;

        return (
          <CitationPill
            key={index}
            index={citationIndex}
            citation={citation}
            document={doc}
            onClick={onCitationClick}
          />
        );
      }
      return part;
    });
  };

  return (
    <div className="text-zinc-800 text-sm leading-relaxed space-y-3">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => {
            const processed = React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                return renderTextWithCitations(child);
              }
              return child;
            });
            return <p className="mb-2.5 last:mb-0 leading-relaxed">{processed}</p>;
          },
          li: ({ children }) => {
            const processed = React.Children.map(children, (child) => {
              if (typeof child === 'string') {
                return renderTextWithCitations(child);
              }
              return child;
            });
            return <li className="leading-relaxed">{processed}</li>;
          },
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-zinc-900 mt-4 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-zinc-900 mt-3.5 mb-1.5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mt-3 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-indigo-400 pl-3.5 py-0.5 text-zinc-600 italic my-2 bg-zinc-50/50 rounded-r-lg">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-zinc-200">
              <table className="min-w-full divide-y divide-zinc-200 text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-100/80 text-zinc-700 font-semibold text-left">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-200 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-zinc-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-zinc-700 whitespace-nowrap">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="font-mono text-xs bg-zinc-100 text-indigo-700 px-1.5 py-0.5 rounded border border-zinc-200">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </Markdown>

      {/* Blinking caret when streaming */}
      {isStreaming && (
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-4 ml-1 bg-indigo-600 animate-pulse align-middle"
        />
      )}
    </div>
  );
}
