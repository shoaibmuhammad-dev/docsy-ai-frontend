"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { createChat, deleteChat, listChats } from "@/lib/api";
import { ApiError, Chat } from "@/lib/types";
import { ActionResult } from "./documents";

// Same set of documents, whatever the order
function sameDocuments(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const first = new Set(a);
  return first.size === a.length && b.every((id) => first.has(id));
}

/**
 * "Chat" button on a document (or "Chat with N selected"): opens the chat that
 * already exists for exactly these documents, and only creates a new one the
 * first time. The newest matching chat wins (the API lists chats newest first).
 *
 * Use createChatAction instead when the user explicitly asks for ANOTHER
 * conversation ("New conversation"), because that one always creates a chat.
 */
export async function openChatAction(
  documentIds: string[],
): Promise<ActionResult<Chat>> {
  try {
    const wanted = [...new Set(documentIds)];
    if (wanted.length === 0) {
      return {
        success: false,
        error: "Select at least one document to start a chat",
      };
    }

    const existing = (await listChats()).find((chat) =>
      sameDocuments(chat.documentIds, wanted),
    );
    if (existing) {
      return { success: true, data: existing };
    }

    const chat = await createChat(wanted);
    revalidatePath("/documents");
    revalidatePath(`/chats/${chat.id}`);
    return { success: true, data: chat };
  } catch (err: unknown) {
    // listChats() redirects to /session/expired when the session is invalid;
    // that redirect must not be swallowed by this catch
    unstable_rethrow(err);

    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to open the chat." };
  }
}

export async function createChatAction(
  documentIds: string[],
): Promise<ActionResult<Chat>> {
  try {
    const chat = await createChat(documentIds);
    revalidatePath("/documents");
    revalidatePath(`/chats/${chat.id}`);
    return { success: true, data: chat };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to create chat room." };
  }
}

export async function deleteChatAction(id: string): Promise<ActionResult> {
  try {
    await deleteChat(id);
    revalidatePath("/documents");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to delete chat." };
  }
}
