export interface User {
  id: string;
  name: string;
  email: string;
}

export type DocumentStatus = "processing" | "ready" | "failed";

export interface PdfDocument {
  id: string;
  title: string;
  status: DocumentStatus;
  pageCount: number;
  errorMessage?: string;
  createdAt: string; // ISO
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Chat {
  id: string;
  title: string;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  index: number;
  docId: string;
  chunkId: string;
  page: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string; // markdown, may contain markers like [1] or [2][3]
  citations: Citation[];
  createdAt: string;
}

export type StreamEvent =
  | { type: "token"; text: string }
  | { type: "done"; messageId: string; citations: Citation[] }
  | { type: "error"; message: string };

export class ApiError extends Error {
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
  }
}
