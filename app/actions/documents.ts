'use server';

import { revalidatePath } from 'next/cache';
import { createDocument, deleteDocument } from '@/lib/api';
import { ApiError, PdfDocument } from '@/lib/types';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function uploadDocumentAction(fileData: {
  name: string;
  size: number;
}): Promise<ActionResult<PdfDocument>> {
  try {
    const doc = await createDocument(fileData);
    revalidatePath('/documents');
    return { success: true, data: doc };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return {
      success: false,
      error: 'Failed to upload document. Please check the file and try again.',
    };
  }
}

export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  try {
    await deleteDocument(id);
    revalidatePath('/documents');
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Failed to delete document.' };
  }
}
