// Client Component (document summary card and suggested starter questions for fresh chats)
'use client';

import React from 'react';
import { PdfDocument } from '@/lib/types';
import { FiFileText, FiHelpCircle, FiArrowRight } from 'react-icons/fi';

interface EmptyChatStateProps {
  documents: PdfDocument[];
  onSelectQuestion: (question: string) => void;
}

export function EmptyChatState({
  documents,
  onSelectQuestion,
}: EmptyChatStateProps) {
  const primaryDoc = documents[0];

  // Dynamic suggested questions based on document type
  let suggestions = [
    'What are the core findings and main takeaways?',
    'Summarize the key sections with cited references.',
    'Are there any notable obligations, limitations or caveats?',
    'List all dates, metrics, and quantitative statistics.',
  ];

  if (primaryDoc?.title.toLowerCase().includes('transformer') || primaryDoc?.title.toLowerCase().includes('deep learning')) {
    suggestions = [
      'What are the core breakthroughs in linear attention mechanisms?',
      'How does KV cache compression reduce inference memory?',
      'What hardware and datasets were evaluated in the benchmark?',
      'Summarize the complexity trade-offs between SSMs and standard attention.',
    ];
  } else if (primaryDoc?.title.toLowerCase().includes('lease')) {
    suggestions = [
      'What is the required notice period for vacating the premises?',
      'Who is responsible for heating and HVAC equipment repairs?',
      'Can you summarize the security deposit return terms?',
      'What are the penalties or grace periods for late rent payments?',
    ];
  } else if (primaryDoc?.title.toLowerCase().includes('resume')) {
    suggestions = [
      'What are the candidate’s primary design achievements?',
      'Which design systems and component tooling are listed?',
      'What quantifiable business impact is highlighted in past roles?',
      'Summarize the candidate’s educational background and certifications.',
    ];
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-6 my-auto">
      {/* Document Summary Card */}
      {primaryDoc && (
        <div className="w-full bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs text-left flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <FiFileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
              Active Document Summary
            </span>
            <h3 className="text-sm font-semibold text-zinc-900 truncate mt-0.5">
              {primaryDoc.title}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {primaryDoc.pageCount} indexed pages · Ready for instant semantic retrieval & citations
            </p>
          </div>
        </div>
      )}

      {/* Suggested Questions */}
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
          <FiHelpCircle className="w-3.5 h-3.5" />
          <span>Suggested questions to get started</span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-left">
          {suggestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(q)}
              className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40 text-xs font-medium text-zinc-700 hover:text-indigo-900 transition-all cursor-pointer group shadow-xs"
            >
              <span className="pr-2">{q}</span>
              <FiArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
