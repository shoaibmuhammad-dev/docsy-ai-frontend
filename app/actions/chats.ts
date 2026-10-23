'use server';

import { revalidatePath } from 'next/cache';
import { createChat, deleteChat } from '@/lib/api';
import { ApiError, Chat } from '@/lib/types';
import { ActionResult } from './documents';

export async function createChatAction(
  documentIds: string[]
): Promise<ActionResult<Chat>> {
  try {
    const chat = await createChat(documentIds);
    revalidatePath('/documents');
    revalidatePath(`/chats/${chat.id}`);
    return { success: true, data: chat };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Failed to create chat room.' };
  }
}

export async function deleteChatAction(id: string): Promise<ActionResult> {
  try {
    await deleteChat(id);
    revalidatePath('/documents');
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Failed to delete chat.' };
  }
}
