"use server";

import { revalidatePath } from "next/cache";
import { createDocument, deleteDocument, getDocumentFileUrl } from "@/lib/api";
import { ApiError, PdfDocument } from "@/lib/types";

export type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, same limit as the API

// Expects a FormData with the PDF in a field named "file":
//   const formData = new FormData(); formData.append("file", file);
//   const result = await uploadDocumentAction(formData);
export async function uploadDocumentAction(
  formData: FormData,
): Promise<ActionResult<PdfDocument>> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please choose a PDF file." };
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { success: false, error: "Only PDF files are supported." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File exceeds the maximum size of 10 MB." };
  }

  try {
    const document = await createDocument(file);
    revalidatePath("/documents");
    return { success: true, data: document };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to upload the document." };
  }
}

export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  try {
    await deleteDocument(id);
    revalidatePath("/documents");
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to delete the document." };
  }
}

// A temporary signed link to view the PDF (valid for about an hour). The viewer
// asks for a fresh one whenever it opens a document, so links never go stale.
export async function getDocumentUrlAction(
  id: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const { url } = await getDocumentFileUrl(id);
    return { success: true, data: { url } };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: "Failed to load the PDF." };
  }
}
