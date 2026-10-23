// Client Component (interactive chat workspace coordinator managing layout zones, streaming, and PDF sync)
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Chat, Message, PdfDocument } from "@/lib/types";
import { useChatStream } from "@/hooks/useChatStream";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ChatHeader } from "./ChatHeader";
import { ChatSidebar } from "./ChatSidebar";
import { MessageItem } from "./MessageItem";
import { MessageComposer } from "./MessageComposer";
import { EmptyChatState } from "./EmptyChatState";
import { PdfViewer } from "@/components/pdf/PdfViewer";
import { Button } from "@/components/ui/Button";
import { FiArrowDown, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

interface ChatWorkspaceProps {
  chat: Chat;
  initialMessages: Message[];
  documents: PdfDocument[];
  allChats: Chat[];
  allDocuments: PdfDocument[];
}

export function ChatWorkspace({
  chat,
  initialMessages,
  documents,
  allChats,
  allDocuments,
}: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeDocId, setActiveDocId] = useState<string>(
    documents[0]?.id || chat.documentIds[0] || "",
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [highlightPage, setHighlightPage] = useState<number | undefined>(
    undefined,
  );

  // Layout states
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isPdfVisible, setIsPdfVisible] = useState<boolean>(true);
  const [mobileTab, setMobileTab] = useState<"chat" | "pdf">("chat");
  const [pdfWidth, setPdfWidth] = useState<number>(480);
  const [isDraggingDivider, setIsDraggingDivider] = useState<boolean>(false);

  // Auto-scroll state
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastUserPromptRef = useRef<string>("");

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const activeDoc = documents.find((d) => d.id === activeDocId) ||
    allDocuments.find((d) => d.id === activeDocId) ||
    documents[0] ||
    allDocuments[0] || {
      id: "doc-1",
      title: "Document",
      pageCount: 1,
      status: "ready" as const,
      createdAt: new Date().toISOString(),
    };

  // Chat Streaming Hook
  const {
    isStreaming,
    streamingContent,
    streamingCitations,
    streamError,
    sendMessage,
    stopStreaming,
  } = useChatStream({
    chatId: chat.id,
    onDone: (completedMsg) => {
      setMessages((prev) => [...prev, completedMsg]);
    },
  });

  // DOM scroll without state mutation inside effect
  const scrollElementToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    },
    [],
  );

  const handleJumpToLatest = () => {
    setIsScrolledUp(false);
    scrollElementToBottom("smooth");
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    setIsScrolledUp(distanceToBottom > 90);
  };

  useEffect(() => {
    if (!isScrolledUp) {
      scrollElementToBottom(isStreaming ? "auto" : "smooth");
    }
  }, [
    messages,
    streamingContent,
    isScrolledUp,
    isStreaming,
    scrollElementToBottom,
  ]);

  // Citation click handler
  const handleCitationClick = useCallback(
    (page: number, docId?: string) => {
      if (docId && docId !== activeDocId) {
        setActiveDocId(docId);
      }
      setCurrentPage(page);
      setHighlightPage(page);

      if (!isDesktop) {
        setMobileTab("pdf");
      } else if (!isPdfVisible) {
        setIsPdfVisible(true);
      }
    },
    [activeDocId, isDesktop, isPdfVisible],
  );

  const handleSendMessage = (text: string) => {
    lastUserPromptRef.current = text;
    // Add user message to UI immediately
    const userMsg: Message = {
      id: `msg-u-${Date.now()}`,
      role: "user",
      content: text,
      citations: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsScrolledUp(false);
    sendMessage(text);
  };

  const handleRetry = () => {
    if (lastUserPromptRef.current) {
      sendMessage(lastUserPromptRef.current);
    }
  };

  // Draggable divider for desktop
  const handleMouseDownDivider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDivider) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 320 && newWidth <= window.innerWidth * 0.65) {
        setPdfWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingDivider(false);
    };

    if (isDraggingDivider) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDivider]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-zinc-50 select-none">
      {/* Top Header */}
      <ChatHeader
        title={chat.title}
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={setActiveDocId}
        isPdfVisible={isPdfVisible}
        onTogglePdf={() => setIsPdfVisible((prev) => !prev)}
        onOpenMobileSidebar={() => {
          if (isDesktop) {
            setDesktopSidebarOpen((prev) => !prev);
          } else {
            setMobileSidebarOpen(true);
          }
        }}
        mobileTab={mobileTab}
        onSelectMobileTab={setMobileTab}
        isDesktop={isDesktop}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Desktop collapsible) */}
        {isDesktop && (
          <ChatSidebar
            currentChatId={chat.id}
            chats={allChats}
            availableDocuments={allDocuments}
            isOpen={desktopSidebarOpen}
            onToggleCollapse={() => setDesktopSidebarOpen(false)}
          />
        )}

        {/* Mobile slide-over drawer */}
        {!isDesktop && (
          <ChatSidebar
            currentChatId={chat.id}
            chats={allChats}
            availableDocuments={allDocuments}
            isOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
            isMobileDrawer
          />
        )}

        {/* Center: Chat panel */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-zinc-50/50 ${
            !isDesktop && mobileTab !== "chat" ? "hidden" : "flex"
          }`}
        >
          {/* Messages scroll area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            aria-live="polite"
            aria-busy={isStreaming}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5"
          >
            {messages.length === 0 && !isStreaming ? (
              <EmptyChatState
                documents={documents}
                onSelectQuestion={handleSendMessage}
              />
            ) : (
              messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  documents={documents}
                  onCitationClick={handleCitationClick}
                />
              ))
            )}

            {/* Currently streaming assistant message */}
            {isStreaming && (
              <MessageItem
                message={{
                  id: "streaming-assistant-msg",
                  role: "assistant",
                  content: streamingContent || "Analyzing document content...",
                  citations: streamingCitations,
                  createdAt: new Date().toISOString(),
                }}
                documents={documents}
                onCitationClick={handleCitationClick}
                isStreaming={true}
              />
            )}

            {/* Thread Error with Retry */}
            {streamError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 space-y-2 text-xs"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <FiAlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Failed to complete generation</span>
                </div>
                <p className="text-zinc-600 leading-relaxed">{streamError}</p>
                <div className="pt-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRetry}
                    leftIcon={<FiRefreshCw className="w-3.5 h-3.5" />}
                  >
                    Retry question
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Floating Jump to Latest Button */}
          {isScrolledUp && (
            <div className="relative">
              <button
                type="button"
                onClick={handleJumpToLatest}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-medium shadow-lg hover:bg-zinc-800 transition-all cursor-pointer animate-in fade-in"
                aria-label="Jump to latest message"
              >
                <FiArrowDown className="w-3.5 h-3.5" />
                <span>Jump to latest</span>
              </button>
            </div>
          )}

          {/* Composer Footer */}
          <div className="p-3 sm:p-4 bg-white border-t border-zinc-200 shrink-0">
            <div className="max-w-3xl mx-auto">
              <MessageComposer
                onSend={handleSendMessage}
                onStop={stopStreaming}
                isStreaming={isStreaming}
                documentTitle={activeDoc.title}
              />
            </div>
          </div>
        </div>

        {/* Draggable Divider (Desktop only, when PDF is visible) */}
        {isDesktop && isPdfVisible && (
          <div
            onMouseDown={handleMouseDownDivider}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize PDF panel divider"
            tabIndex={0}
            className={`w-1.5 hover:w-2 bg-zinc-200 hover:bg-indigo-500 cursor-col-resize shrink-0 transition-colors z-20 ${
              isDraggingDivider ? "bg-indigo-600 w-2" : ""
            }`}
          />
        )}

        {/* Right: PDF Panel */}
        <div
          style={
            isDesktop && isPdfVisible ? { width: `${pdfWidth}px` } : undefined
          }
          className={`${
            isDesktop
              ? isPdfVisible
                ? "flex shrink-0"
                : "hidden"
              : mobileTab === "pdf"
                ? "flex flex-1"
                : "hidden"
          } overflow-hidden h-full`}
        >
          <PdfViewer
            fileUrl={`/mock-files/${activeDoc.id}.pdf`}
            pageCount={activeDoc.pageCount || 10}
            currentPage={currentPage}
            highlightPage={highlightPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
