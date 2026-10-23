'use client';

import { useState, useRef, useCallback } from 'react';
import { Citation, Message } from '@/lib/types';

interface UseChatStreamOptions {
  chatId: string;
  onDone?: (message: Message) => void;
  onError?: (errorMessage: string) => void;
}

export function useChatStream({
  chatId,
  onDone,
  onError,
}: UseChatStreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || isStreaming) return;

      setIsStreaming(true);
      setStreamingContent('');
      setStreamingCitations([]);
      setStreamError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: 'Failed to connect' }));
          const msg = errData.message || `Request failed with status ${response.status}`;
          setStreamError(msg);
          onError?.(msg);
          setIsStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported by browser/runtime');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let currentText = '';
        let completedMessage: Message | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          // keep remainder
          buffer = lines.pop() || '';

          for (const block of lines) {
            const rawLines = block.split('\n');
            let eventType = 'message';
            let dataStr = '';

            for (const line of rawLines) {
              if (line.startsWith('event: ')) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith('data: ')) {
                dataStr = line.slice(6).trim();
              }
            }

            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              if (eventType === 'token' && typeof data.text === 'string') {
                currentText += data.text;
                setStreamingContent(currentText);
              } else if (eventType === 'done') {
                const citations = Array.isArray(data.citations) ? data.citations : [];
                setStreamingCitations(citations);
                completedMessage = {
                  id: data.messageId || `msg-${Date.now()}`,
                  role: 'assistant',
                  content: currentText,
                  citations,
                  createdAt: new Date().toISOString(),
                };
              } else if (eventType === 'error') {
                const errMsg = data.message || 'Stream processing error';
                setStreamError(errMsg);
                onError?.(errMsg);
              }
            } catch {
              // Ignore non-JSON ping/keepalive
            }
          }
        }

        if (completedMessage) {
          onDone?.(completedMessage);
        } else if (currentText) {
          // If stream ended without explicit done event (e.g. stopped)
          const fallbackMsg: Message = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: currentText,
            citations: [],
            createdAt: new Date().toISOString(),
          };
          onDone?.(fallbackMsg);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User clicked stop
          if (streamingContent) {
            const partialMsg: Message = {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: streamingContent + '\n\n*(Response stopped)*',
              citations: [],
              createdAt: new Date().toISOString(),
            };
            onDone?.(partialMsg);
          }
        } else {
          const msg = err instanceof Error ? err.message : 'Unknown streaming error';
          setStreamError(msg);
          onError?.(msg);
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [chatId, isStreaming, onDone, onError, streamingContent]
  );

  return {
    isStreaming,
    streamingContent,
    streamingCitations,
    streamError,
    sendMessage,
    stopStreaming,
  };
}
