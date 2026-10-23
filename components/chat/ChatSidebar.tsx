// Client Component (chat history sidebar with search, new chat modal trigger, and delete menu)
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chat, PdfDocument } from '@/lib/types';
import { formatRelativeTime } from '@/lib/format';
import { deleteChatAction } from '@/app/actions/chats';
import { Button } from '@/components/ui/Button';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { NewChatModal } from '@/components/documents/NewChatModal';
import { useToast } from '@/components/ui/Toast';
import {
  FiPlus,
  FiSearch,
  FiMessageSquare,
  FiMoreVertical,
  FiTrash2,
  FiX,
  FiChevronLeft,
} from 'react-icons/fi';

interface ChatSidebarProps {
  currentChatId: string;
  chats: Chat[];
  availableDocuments: PdfDocument[];
  isOpen: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  isMobileDrawer?: boolean;
}

export function ChatSidebar({
  currentChatId,
  chats,
  availableDocuments,
  isOpen,
  onClose,
  onToggleCollapse,
  isMobileDrawer = false,
}: ChatSidebarProps) {
  const [search, setSearch] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    const res = await deleteChatAction(chatToDelete.id);
    setIsDeleting(false);
    const deletedId = chatToDelete.id;
    setChatToDelete(null);

    if (res.success) {
      toast({
        type: 'success',
        title: 'Chat removed',
        description: 'The conversation history was deleted.',
      });

      // If deleted current chat, redirect to /documents or next chat
      if (deletedId === currentChatId) {
        const remaining = chats.filter((c) => c.id !== deletedId);
        if (remaining.length > 0) {
          router.push(`/chats/${remaining[0].id}`);
        } else {
          router.push('/documents');
        }
      } else {
        router.refresh();
      }
    } else {
      toast({
        type: 'error',
        title: 'Delete failed',
        description: res.error,
      });
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 w-72 shrink-0">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-zinc-200 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Chat History
        </span>
        <div className="flex items-center gap-1">
          {onToggleCollapse && !isMobileDrawer && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label="Collapse sidebar"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}
          {isMobileDrawer && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
              aria-label="Close drawer"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* New Chat Button & Search */}
      <div className="p-3 space-y-2 border-b border-zinc-100">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowNewChatModal(true)}
          className="w-full justify-start text-xs font-semibold"
          leftIcon={<FiPlus className="w-4 h-4 text-indigo-600" />}
        >
          New conversation
        </Button>

        <div className="relative">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50/70 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredChats.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-400">
            {chats.length === 0 ? 'No conversations yet.' : 'No matching chats.'}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === currentChatId;

            return (
              <div
                key={chat.id}
                className={`group flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-900 font-semibold'
                    : 'text-zinc-700 hover:bg-zinc-100/80'
                }`}
              >
                <Link
                  href={`/chats/${chat.id}`}
                  onClick={() => isMobileDrawer && onClose?.()}
                  className="flex items-center gap-2 min-w-0 flex-1 py-0.5"
                >
                  <FiMessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-indigo-600' : 'text-zinc-400'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{chat.title}</p>
                    <p className="text-[10px] text-zinc-400 font-normal">
                      {formatRelativeTime(chat.updatedAt)}
                    </p>
                  </div>
                </Link>

                {/* More options menu */}
                <DropdownMenu
                  align="right"
                  trigger={
                    <button
                      type="button"
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      aria-label="Chat options"
                    >
                      <FiMoreVertical className="w-3.5 h-3.5" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Delete chat',
                      icon: <FiTrash2 className="w-3.5 h-3.5" />,
                      isDestructive: true,
                      onClick: () => setChatToDelete(chat),
                    },
                  ]}
                />
              </div>
            );
          })
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        availableDocuments={availableDocuments}
      />

      {/* Delete Chat Confirm Dialog */}
      <ConfirmDialog
        isOpen={chatToDelete !== null}
        onClose={() => setChatToDelete(null)}
        onConfirm={handleDeleteChat}
        title="Delete conversation"
        message={`Are you sure you want to delete "${chatToDelete?.title}"? All message history will be permanently erased.`}
        confirmLabel="Delete"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );

  if (isMobileDrawer) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
        <div className="relative z-10 w-72 h-full shadow-2xl animate-in slide-in-from-left duration-200">
          {content}
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return content;
}
