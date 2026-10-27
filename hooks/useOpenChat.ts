// Client hook (opens the existing chat for some documents, or creates it the first time)
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { openChatAction } from "@/app/actions/chats";
import { useToast } from "@/components/ui/Toast";

export function useOpenChat() {
  const router = useRouter();
  const { toast } = useToast();

  // The documents currently being opened, e.g. "doc1" or "doc1,doc2"
  const [openingKey, setOpeningKey] = useState<string | null>(null);

  const openChat = useCallback(
    async (documentIds: string[]) => {
      if (openingKey !== null) return; // already opening one: ignore extra clicks

      setOpeningKey(documentIds.join(","));
      const result = await openChatAction(documentIds);

      if (result.success && result.data) {
        // Stay in the "opening" state until the page changes, so a second click
        // during the navigation can't start another request
        router.push(`/chats/${result.data.id}`);
        return;
      }

      setOpeningKey(null);
      toast({
        type: "error",
        title: "Couldn't open the chat",
        description: result.success ? "Please try again." : result.error,
      });
    },
    [openingKey, router, toast],
  );

  return {
    openChat,
    // true while opening any chat (use it to disable all Chat buttons)
    isOpening: openingKey !== null,
    // true while opening this exact set of documents (use it for the spinner)
    isOpeningDocuments: (documentIds: string[]) =>
      openingKey === documentIds.join(","),
  };
}
