// Client Component (auto-growing composer with keyboard shortcuts, char counter, and stop button)
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { FiArrowUp, FiSquare } from 'react-icons/fi';

interface MessageComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  documentTitle?: string;
  disabled?: boolean;
}

export function MessageComposer({
  onSend,
  onStop,
  isStreaming,
  documentTitle = 'the document',
  disabled = false,
}: MessageComposerProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_CHARS = 2000;
  const WARNING_CHARS = 1800;

  // Auto grow textarea up to 6 lines (~144px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 6 * 24; // ~144px
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;

    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const cleanDocTitle = documentTitle.replace(/\.pdf$/i, '');
  const placeholder = `Ask anything about ${cleanDocTitle}...`;

  return (
    <div className="relative w-full border border-zinc-200 rounded-2xl bg-white shadow-xs focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all p-2.5">
      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            setInput(e.target.value);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isStreaming || disabled}
        className="w-full resize-none bg-transparent px-2 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 leading-relaxed max-h-36 overflow-y-auto"
      />

      <div className="flex items-center justify-between pt-2 px-1">
        {/* Character counter (visible from 1800 of 2000) */}
        <div>
          {input.length >= WARNING_CHARS && (
            <span
              className={`text-[11px] font-mono tabular-nums ${
                input.length >= MAX_CHARS ? 'text-red-600 font-bold' : 'text-amber-600'
              }`}
            >
              {input.length} / {MAX_CHARS}
            </span>
          )}
        </div>

        {/* Action Button: Stop while streaming, otherwise Send */}
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onStop}
              aria-label="Stop generating response"
              leftIcon={<FiSquare className="w-3.5 h-3.5 fill-current" />}
            >
              Stop
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              aria-label="Send message"
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <FiArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
