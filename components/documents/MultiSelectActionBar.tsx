// Client Component (floating action bar for multi-document chat initiation)
'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createChatAction } from '@/app/actions/chats';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { FiMessageSquare, FiX } from 'react-icons/fi';

interface MultiSelectActionBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export function MultiSelectActionBar({
  selectedIds,
  onClear,
}: MultiSelectActionBarProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;

  const handleStartMultiChat = () => {
    startTransition(async () => {
      const res = await createChatAction(selectedIds);
      if (res.success && res.data) {
        toast({
          type: 'success',
          title: 'Multi-document chat created',
          description: `Initialized chat with ${count} selected documents.`,
        });
        router.push(`/chats/${res.data.id}`);
      } else {
        toast({
          type: 'error',
          title: 'Failed to create chat',
          description: res.error,
        });
      }
    });
  };

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-zinc-900 text-white rounded-2xl shadow-xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
            {count}
          </span>
          <span className="text-xs font-medium text-zinc-200">
            {count === 1 ? '1 document selected' : `${count} documents selected`}
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-700" />

        <Button
          variant="primary"
          size="sm"
          onClick={handleStartMultiChat}
          isLoading={isPending}
          leftIcon={<FiMessageSquare className="w-3.5 h-3.5" />}
        >
          Chat with {count} selected
        </Button>

        <button
          type="button"
          onClick={onClear}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          aria-label="Clear selection"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
